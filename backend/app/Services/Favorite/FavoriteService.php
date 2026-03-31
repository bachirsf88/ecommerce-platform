<?php

namespace App\Services\Favorite;

use App\Models\Product;
use App\Models\User;
use App\Repositories\Interfaces\FavoriteRepositoryInterface;

class FavoriteService
{
    public function __construct(
        private readonly FavoriteRepositoryInterface $favoriteRepository
    ) {
    }

    public function getFavorites(User $user): array
    {
        $favorites = $this->favoriteRepository->getFavoritesByUserId($user->id);

        return $favorites
            ->map(fn ($favorite) => $this->formatProduct($favorite->product))
            ->filter()
            ->values()
            ->all();
    }

    public function addFavorite(User $user, array $data): ?array
    {
        $product = Product::find($data['product_id']);

        if (! $product) {
            return null;
        }

        $favorite = $this->favoriteRepository->findFavoriteByUserAndProductId(
            $user->id,
            $product->id
        );

        if (! $favorite) {
            $favorite = $this->favoriteRepository->createFavorite([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
        }

        return [
            'product_id' => $product->id,
            'is_favorite' => true,
            'product' => $this->formatProduct($favorite->product ?? $product),
        ];
    }

    public function removeFavorite(User $user, int|string $productId): ?array
    {
        $favorite = $this->favoriteRepository->findFavoriteByUserAndProductId(
            $user->id,
            $productId
        );

        if (! $favorite) {
            return null;
        }

        $this->favoriteRepository->deleteFavorite($favorite);

        return [
            'product_id' => (int) $productId,
            'is_favorite' => false,
        ];
    }

    private function formatProduct(?Product $product): ?array
    {
        if (! $product) {
            return null;
        }

        return [
            'id' => $product->id,
            'seller_id' => $product->seller_id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock' => $product->stock,
            'category' => $product->category,
            'image' => $product->image,
            'status' => $product->status,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }
}
