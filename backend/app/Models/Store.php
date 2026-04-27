<?php

namespace App\Models;

use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HandlesPublicFiles;
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
        return $this->publicFileUrl($path);
    }
}
