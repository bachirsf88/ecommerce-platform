<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'store_name',
        'store_address',
        'postal_code',
        'description',
        'contact_email',
        'phone_number',
        'logo_path',
        'banner_path',
    ];

    protected $appends = [
        'logo_url',
        'banner_url',
        'logo_image_url',
        'banner_image_url',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->resolveMediaUrl($this->logo_path);
    }

    public function getBannerUrlAttribute(): ?string
    {
        return $this->resolveMediaUrl($this->banner_path);
    }

    public function getLogoImageUrlAttribute(): ?string
    {
        return $this->getLogoUrlAttribute();
    }

    public function getBannerImageUrlAttribute(): ?string
    {
        return $this->getBannerUrlAttribute();
    }

    private function resolveMediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|data:|blob:)/i', $path) === 1) {
            return $path;
        }

        $baseUrl = request()
            ? rtrim(request()->getSchemeAndHttpHost(), '/')
            : rtrim((string) config('app.url'), '/');

        if (str_starts_with($path, '/storage/')) {
            return $baseUrl . $path;
        }

        $storageUrl = Storage::disk('public')->url($path);

        if (preg_match('/^https?:\/\//i', $storageUrl) === 1) {
            return $storageUrl;
        }

        if (str_starts_with($storageUrl, '/')) {
            return $baseUrl . $storageUrl;
        }

        return $baseUrl . '/' . ltrim($storageUrl, '/');
    }
}
