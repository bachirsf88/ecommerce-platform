<?php

namespace App\Http\Controllers\API\Favorite;

use App\Http\Controllers\Controller;
use App\Services\Favorite\FavoriteService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly FavoriteService $favoriteService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $favorites = $this->favoriteService->getFavorites($request->user());

        return $this->successResponse('Favorites fetched successfully.', $favorites);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
        ]);

        $favorite = $this->favoriteService->addFavorite($request->user(), $validated);

        if (! $favorite) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        return $this->successResponse('Product added to favorites successfully.', $favorite, 201);
    }

    public function destroy(Request $request, string $productId): JsonResponse
    {
        $favorite = $this->favoriteService->removeFavorite($request->user(), $productId);

        if (! $favorite) {
            return $this->errorResponse('Favorite not found.', null, 404);
        }

        return $this->successResponse('Product removed from favorites successfully.', $favorite);
    }
}
