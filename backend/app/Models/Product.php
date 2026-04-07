<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'seller_id',
        'name',
        'description',
        'price',
        'stock',
        'category',
        'image',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        $path = $this->image;

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
