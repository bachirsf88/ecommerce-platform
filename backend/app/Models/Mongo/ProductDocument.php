<?php

namespace App\Models\Mongo;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use MongoDB\Laravel\Eloquent\Model;

class ProductDocument extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $connection = 'mongodb';
    protected $table = 'products';
    protected $appends = ['id', 'image_url'];
    protected $hidden = ['_id'];

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

    public function getIdAttribute($value = null): ?string
    {
        $id = $value ?? $this->getKey();

        return $id !== null ? (string) $id : null;
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

        return $baseUrl . Storage::disk('public')->url($path);
    }
}
