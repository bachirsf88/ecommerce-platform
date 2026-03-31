<?php

namespace App\Repositories\Interfaces;

use App\Models\Favorite;
use Illuminate\Database\Eloquent\Collection;

interface FavoriteRepositoryInterface
{
    public function getFavoritesByUserId(int|string $userId): Collection;

    public function findFavoriteByUserAndProductId(int|string $userId, int|string $productId): ?Favorite;

    public function createFavorite(array $data): Favorite;

    public function deleteFavorite(Favorite $favorite): bool;
}
