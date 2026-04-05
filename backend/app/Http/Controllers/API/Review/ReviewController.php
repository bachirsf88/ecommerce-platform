<?php

namespace App\Http\Controllers\API\Review;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Services\Review\ReviewService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ReviewService $reviewService
    ) {
    }

    public function indexByProduct(string $id): JsonResponse
    {
        $reviews = $this->reviewService->getProductReviews($id);

        if (! $reviews) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        return $this->successResponse('Reviews fetched successfully.', $reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $result = $this->reviewService->createReview(
            $request->user(),
            $request->validated()
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse(
            $result['message'],
            $result['data'],
            $result['status_code']
        );
    }
}
