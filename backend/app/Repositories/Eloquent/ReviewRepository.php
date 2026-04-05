<?php

namespace App\Repositories\Eloquent;

use App\Models\Review;
use App\Repositories\Interfaces\ReviewRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository implements ReviewRepositoryInterface
{
    public function createReview(array $data): Review
    {
        return Review::create($data);
    }

    public function findBuyerReviewByOrderAndProductId(
        int|string $buyerId,
        int|string $orderId,
        int|string $productId
    ): ?Review {
        return Review::where('buyer_id', $buyerId)
            ->where('order_id', $orderId)
            ->where('product_id', (string) $productId)
            ->first();
    }

    public function getReviewsByProductId(int|string $productId): Collection
    {
        return Review::with('buyer')
            ->where('product_id', (string) $productId)
            ->latest()
            ->get();
    }
}
