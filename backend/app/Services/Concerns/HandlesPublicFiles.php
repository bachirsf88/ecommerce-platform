<?php

namespace App\Services\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

trait HandlesPublicFiles
{
    protected function mediaDisk(): string
    {
        return strtolower(trim((string) env('MEDIA_DISK', 'local')));
    }

    protected function usesSupabaseMediaDisk(): bool
    {
        return $this->mediaDisk() === 'supabase';
    }

    protected function publicFileBaseUrl(): string
    {
        $request = request();

        if ($request) {
            return rtrim($request->getSchemeAndHttpHost(), '/');
        }

        return rtrim((string) config('app.url'), '/');
    }

    protected function storePublicFile(UploadedFile $file, string $directory): string
    {
        if ($this->usesSupabaseMediaDisk()) {
            return $this->storeSupabasePublicFile($file, $directory);
        }

        return $file->store($directory, 'public');
    }

    /**
     * @param  UploadedFile[]  $files
     * @return string[]
     */
    protected function storePublicFiles(array $files, string $directory): array
    {
        return collect($files)
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->map(fn (UploadedFile $file) => $this->storePublicFile($file, $directory))
            ->values()
            ->all();
    }

    protected function normalizeStoredFileInput(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        $trimmedPath = trim($path);

        if ($trimmedPath === '') {
            return null;
        }

        $relativePath = $this->normalizePublicPath($trimmedPath);

        if ($relativePath !== null) {
            return $relativePath;
        }

        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $trimmedPath) === 1) {
            return null;
        }

        return ltrim($trimmedPath, '/');
    }

    protected function publicFileUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $path) === 1) {
            return $path;
        }

        if (str_starts_with($path, '/storage/')) {
            return $this->publicFileBaseUrl() . $path;
        }

        $storageUrl = Storage::disk('public')->url($path);

        if (preg_match('/^https?:\/\//i', $storageUrl) === 1) {
            return $storageUrl;
        }

        if (str_starts_with($storageUrl, '/')) {
            return $this->publicFileBaseUrl() . $storageUrl;
        }

        return $this->publicFileBaseUrl() . '/' . ltrim($storageUrl, '/');
    }

    protected function deletePublicFile(?string $path): void
    {
        $supabaseObjectPath = $this->extractSupabaseObjectPath($path);

        if ($supabaseObjectPath !== null) {
            $this->deleteSupabasePublicFile($supabaseObjectPath);
        }

        $relativePath = $this->normalizePublicPath($path);

        if (! $relativePath) {
            return;
        }

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * @param  array<int, string|null>  $paths
     */
    protected function deletePublicFiles(array $paths): void
    {
        collect($paths)
            ->filter(fn ($path) => is_string($path) && trim($path) !== '')
            ->unique()
            ->each(fn ($path) => $this->deletePublicFile($path));
    }

    protected function normalizePublicPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $path) === 1) {
            $parsedPath = parse_url($path, PHP_URL_PATH);

            if (! is_string($parsedPath)) {
                return null;
            }

            if (! str_starts_with($parsedPath, '/storage/')) {
                return null;
            }

            $path = $parsedPath;
        }

        if (str_starts_with($path, '/storage/')) {
            return ltrim(substr($path, strlen('/storage/')), '/');
        }

        if (str_starts_with($path, 'storage/')) {
            return ltrim(substr($path, strlen('storage/')), '/');
        }

        return preg_match('/^(https?:\/\/|data:)/i', $path) === 1 ? null : ltrim($path, '/');
    }

    protected function storeSupabasePublicFile(UploadedFile $file, string $directory): string
    {
        $supabaseUrl = $this->supabaseUrl();
        $serviceRoleKey = $this->supabaseServiceRoleKey();
        $bucket = $this->supabaseBucket();
        $objectPath = $this->buildSupabaseObjectPath($directory, $file);
        $fileContents = file_get_contents($file->getRealPath());

        if ($supabaseUrl === '' || $serviceRoleKey === '' || $bucket === '') {
            throw new RuntimeException('Supabase media storage is not configured.');
        }

        if ($fileContents === false) {
            throw new RuntimeException('Failed to read the uploaded file for Supabase storage.');
        }

        $response = Http::withToken($serviceRoleKey)
            ->withHeaders([
                'apikey' => $serviceRoleKey,
                'x-upsert' => 'false',
            ])
            ->withBody($fileContents, $file->getMimeType() ?: 'application/octet-stream')
            ->post($this->supabaseObjectEndpoint($bucket, $objectPath));

        if (! $response->successful()) {
            throw new RuntimeException('Failed to upload media to Supabase storage.');
        }

        return $this->supabasePublicFileUrl($bucket, $objectPath);
    }

    protected function deleteSupabasePublicFile(string $objectPath): void
    {
        $supabaseUrl = $this->supabaseUrl();
        $serviceRoleKey = $this->supabaseServiceRoleKey();
        $bucket = $this->supabaseBucket();

        if ($supabaseUrl === '' || $serviceRoleKey === '' || $bucket === '') {
            return;
        }

        $response = Http::withToken($serviceRoleKey)
            ->withHeaders([
                'apikey' => $serviceRoleKey,
            ])
            ->delete($this->supabaseObjectEndpoint($bucket, $objectPath));

        if ($response->status() === 404 || $response->successful()) {
            return;
        }
    }

    protected function extractSupabaseObjectPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $bucket = $this->supabaseBucket();

        if ($bucket === '') {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $path) === 1) {
            $parsedPath = parse_url($path, PHP_URL_PATH);

            if (! is_string($parsedPath)) {
                return null;
            }

            $publicPrefix = '/storage/v1/object/public/' . $bucket . '/';
            $privatePrefix = '/storage/v1/object/' . $bucket . '/';

            if (str_starts_with($parsedPath, $publicPrefix)) {
                return ltrim(substr($parsedPath, strlen($publicPrefix)), '/');
            }

            if (str_starts_with($parsedPath, $privatePrefix)) {
                return ltrim(substr($parsedPath, strlen($privatePrefix)), '/');
            }

            return null;
        }

        if (str_starts_with($path, '/storage/') || str_starts_with($path, 'storage/')) {
            return null;
        }

        if ($this->usesSupabaseMediaDisk()) {
            return ltrim($path, '/');
        }

        return null;
    }

    protected function buildSupabaseObjectPath(string $directory, UploadedFile $file): string
    {
        $normalizedDirectory = trim($directory, '/');
        $safeName = $this->generateSafeFilename($file);

        return $normalizedDirectory === '' ? $safeName : $normalizedDirectory . '/' . $safeName;
    }

    protected function generateSafeFilename(UploadedFile $file): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeBaseName = Str::slug($originalName);
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');

        return ($safeBaseName !== '' ? $safeBaseName : 'media')
            . '-' . Str::uuid()->toString()
            . '.' . $extension;
    }

    protected function supabaseUrl(): string
    {
        return rtrim((string) config('services.supabase.url'), '/');
    }

    protected function supabaseServiceRoleKey(): string
    {
        return trim((string) config('services.supabase.service_role_key'));
    }

    protected function supabaseBucket(): string
    {
        return trim((string) config('services.supabase.storage_bucket'));
    }

    protected function supabaseObjectEndpoint(string $bucket, string $objectPath): string
    {
        return $this->supabaseUrl()
            . '/storage/v1/object/'
            . rawurlencode($bucket)
            . '/'
            . implode('/', array_map('rawurlencode', explode('/', ltrim($objectPath, '/'))));
    }

    protected function supabasePublicFileUrl(string $bucket, string $objectPath): string
    {
        return $this->supabaseUrl()
            . '/storage/v1/object/public/'
            . rawurlencode($bucket)
            . '/'
            . implode('/', array_map('rawurlencode', explode('/', ltrim($objectPath, '/'))));
    }
}
