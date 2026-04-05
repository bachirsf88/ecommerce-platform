<?php

namespace App\Services\Review;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\ReviewRepositoryInterface;

class ReviewService
{
    public function __construct(
        private readonly ReviewRepositoryInterface $reviewRepository,
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getProductReviews(int|string $productId): ?array
    {
        $product = $this->productRepository->findById($productId);

        if (! $product) {
            return null;
        }

        $normalizedProductId = (string) ($product->id ?? $productId);
        $reviews = $this->reviewRepository->getReviewsByProductId($normalizedProductId);

        return [
            'product_id' => $normalizedProductId,
            'average_rating' => $reviews->isNotEmpty()
                ? round((float) $reviews->avg('rating'), 1)
                : null,
            'review_count' => $reviews->count(),
            'reviews' => $reviews
                ->map(fn (Review $review) => $this->formatReview($review))
                ->all(),
        ];
    }

    public function createReview(User $buyer, array $data): array
    {
        if (! $buyer->isBuyer()) {
            return $this->failureResult('Only buyers can leave reviews.', 403);
        }

        $product = $this->productRepository->findById($data['product_id']);

        if (! $product) {
            return $this->failureResult('Product not found.', 404);
        }

        $normalizedProductId = $this->normalizeProductId($product->id ?? $data['product_id']);
        $order = $this->orderRepository->findBuyerOrderById($buyer->id, $data['order_id']);

        if (! $order) {
            return $this->failureResult('Order not found.', 404);
        }

        $order->loadMissing('items');

        if ($order->status !== Order::STATUS_DELIVERED) {
            return $this->failureResult('Review is only allowed after delivery.', 422);
        }

        $orderedItem = $order->items->first(
            fn (OrderItem $item) => $this->normalizeProductId($item->product_id) === $normalizedProductId
        );

        if (! $orderedItem) {
            return $this->failureResult('You can only review products included in this order.', 422);
        }

        $existingReview = $this->reviewRepository->findBuyerReviewByOrderAndProductId(
            $buyer->id,
            $order->id,
            $normalizedProductId
        );

        if ($existingReview) {
            return $this->failureResult(
                'You have already reviewed this product for this order.',
                409
            );
        }

        $review = $this->reviewRepository->createReview([
            'buyer_id' => $buyer->id,
            'order_id' => $order->id,
            'product_id' => $normalizedProductId,
            'rating' => (int) $data['rating'],
            'comment' => isset($data['comment']) ? trim((string) $data['comment']) ?: null : null,
        ])->load('buyer');

        return [
            'success' => true,
            'message' => 'Review created successfully.',
            'status_code' => 201,
            'data' => $this->formatReview($review),
        ];
    }

    private function failureResult(string $message, int $statusCode): array
    {
        return [
            'success' => false,
            'message' => $message,
            'status_code' => $statusCode,
        ];
    }

    private function formatReview(Review $review): array
    {
        return [
            'id' => $review->id,
            'buyer_id' => $review->buyer_id,
            'order_id' => $review->order_id,
            'product_id' => (string) $review->product_id,
            'rating' => (int) $review->rating,
            'comment' => $review->comment,
            'buyer' => [
                'id' => $review->buyer?->id,
                'name' => $review->buyer?->name,
            ],
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
        ];
    }

    private function normalizeProductId(int|string|null $productId): string
    {
        return trim((string) $productId);
    }
}
