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

    private function resolveMediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|data:|\/storage\/)/i', $path) === 1) {
            return $path;
        }

        return url(Storage::disk('public')->url($path));
    }
}
