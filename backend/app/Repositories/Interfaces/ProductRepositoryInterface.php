<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function getAll(): Collection;

    public function findById(int|string $id);

    public function findApprovedById(int|string $id);

    public function search(?string $keyword): Collection;

    public function filter(array $filters): Collection;

    public function getBySellerId(int|string $sellerId): Collection;

    public function findBySellerId(int|string $id, int|string $sellerId);

    public function filterAll(array $filters): Collection;

    public function getApprovedByCategory(int|string $categoryId, ?string $legacyCategoryName = null): Collection;

    public function countByCategory(int|string $categoryId, ?string $legacyCategoryName = null): int;

    public function syncCategoryName(int|string $categoryId, string $categoryName): void;

    public function create(array $data);

    public function update($product, array $data);

    public function delete($product): bool;
}
