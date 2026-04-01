<?php

namespace App\Repositories\Eloquent;

use App\Models\Favorite;
use App\Repositories\Interfaces\FavoriteRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class FavoriteRepository implements FavoriteRepositoryInterface
{
    public function getFavoritesByUserId(int|string $userId): Collection
    {
        return Favorite::where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function findFavoriteByUserAndProductId(int|string $userId, int|string $productId): ?Favorite
    {
        return Favorite::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();
    }

    public function createFavorite(array $data): Favorite
    {
        return Favorite::create($data);
    }

    public function deleteFavorite(Favorite $favorite): bool
    {
        return (bool) $favorite->delete();
    }
}
