<?php

namespace App\Services\Favorite;

use App\Models\User;
use App\Repositories\Interfaces\FavoriteRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;

class FavoriteService
{
    public function __construct(
        private readonly FavoriteRepositoryInterface $favoriteRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getFavorites(User $user): array
    {
        $favorites = $this->favoriteRepository->getFavoritesByUserId($user->id);

        return $favorites
            ->map(function ($favorite) {
                $product = $this->productRepository->findById($favorite->product_id);

                return $this->formatProduct($product);
            })
            ->filter()
            ->values()
            ->all();
    }

    public function addFavorite(User $user, array $data): ?array
    {
        $product = $this->productRepository->findById($data['product_id']);

        if (! $product) {
            return null;
        }

        if (($product->status ?? null) !== 'active') {
            return null;
        }

        $productId = (string) $product->id;

        $favorite = $this->favoriteRepository->findFavoriteByUserAndProductId(
            $user->id,
            $productId
        );

        if (! $favorite) {
            $favorite = $this->favoriteRepository->createFavorite([
                'user_id' => $user->id,
                'product_id' => $productId,
            ]);
        }

        return [
            'product_id' => $productId,
            'is_favorite' => true,
            'product' => $this->formatProduct($product),
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
            'product_id' => (string) $productId,
            'is_favorite' => false,
        ];
    }

    private function formatProduct($product): ?array
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
