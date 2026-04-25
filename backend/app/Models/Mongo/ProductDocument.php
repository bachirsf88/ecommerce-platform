<?php

namespace App\Models\Mongo;

use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class ProductDocument extends Model
{
    use HasFactory;
    use HandlesPublicFiles;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $connection = 'mongodb';
    protected $table = 'products';
    protected $appends = ['id', 'image_url', 'image_urls', 'video_url'];
    protected $hidden = ['_id'];

    protected $fillable = [
        'seller_id',
        'name',
        'description',
        'price',
        'stock',
        'category',
        'image',
        'images',
        'video',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'images' => 'array',
    ];

    public function getIdAttribute($value = null): ?string
    {
        $id = $value ?? $this->getKey();

        return $id !== null ? (string) $id : null;
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->publicFileUrl($this->image);
    }

    public function getImageUrlsAttribute(): array
    {
        $rawImages = collect($this->images ?? [])
            ->filter(fn ($value) => is_string($value) && trim($value) !== '');

        $primaryImage = is_string($this->image) ? trim($this->image) : null;

        if ($primaryImage) {
            $rawImages = $rawImages->prepend($primaryImage);
        }

        return $rawImages
            ->unique()
            ->map(fn (string $path) => $this->publicFileUrl($path))
            ->filter()
            ->values()
            ->all();
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->publicFileUrl($this->video);
    }
}
