<?php

namespace App\Services\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesPublicFiles
{
    protected function storePublicFile(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }

    protected function publicFileUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|data:|\/storage\/)/i', $path) === 1) {
            return $path;
        }

        return url(Storage::disk('public')->url($path));
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

    private function normalizePublicPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $path) === 1) {
            $parsedPath = parse_url($path, PHP_URL_PATH);

            if (! is_string($parsedPath)) {
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
