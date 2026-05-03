<?php

namespace App\Models\Mongo;

use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class ProductDocument extends Model
{
    use HasFactory;
    use HandlesPublicFiles;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_INACTIVE = 'inactive';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_INACTIVE,
    ];

    protected $connection = 'mongodb';
    protected $table = 'products';
    protected $appends = ['id', 'image_url', 'image_urls', 'video_url'];
    protected $hidden = ['_id'];
    protected $attributes = [
        'status' => self::STATUS_PENDING,
    ];

    protected $fillable = [
        'seller_id',
        'category_id',
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
        'category_id' => 'integer',
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
