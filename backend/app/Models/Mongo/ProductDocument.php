<?php

namespace App\Models\Mongo;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class ProductDocument extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $connection = 'mongodb';
    protected $table = 'products';
    protected $appends = ['id'];
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
}
