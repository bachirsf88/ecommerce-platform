<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'order_id',
        'product_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'buyer_id' => 'integer',
        'order_id' => 'integer',
        'product_id' => 'string',
        'rating' => 'integer',
    ];

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
