<?php

namespace App\Repositories\Interfaces;

use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

interface ReviewRepositoryInterface
{
    public function createReview(array $data): Review;

    public function findBuyerReviewByOrderAndProductId(
        int|string $buyerId,
        int|string $orderId,
        int|string $productId
    ): ?Review;

    public function getReviewsByProductId(int|string $productId): Collection;
}
