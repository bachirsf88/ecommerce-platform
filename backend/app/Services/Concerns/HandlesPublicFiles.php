<?php

namespace App\Services\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesPublicFiles
{
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
        return $file->store($directory, 'public');
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
        $relativePath = $this->normalizePublicPath($path);

        if (! $relativePath) {
            return;
        }

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
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
}
