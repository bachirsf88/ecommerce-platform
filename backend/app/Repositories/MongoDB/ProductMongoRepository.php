<?php

namespace App\Repositories\MongoDB;

use App\Models\Mongo\ProductDocument;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductMongoRepository implements ProductRepositoryInterface
{
    public function getAll(): Collection
    {
        return $this->newPublicQuery()
            ->latest()
            ->get();
    }

    public function findById(int|string $id): ?ProductDocument
    {
        return ProductDocument::find($id);
    }

    public function findApprovedById(int|string $id): ?ProductDocument
    {
        return $this->newPublicQuery()
            ->whereKey($id)
            ->first();
    }

    public function search(?string $keyword): Collection
    {
        return $this->newPublicQuery()
            ->when($keyword, fn ($query, $keyword) => $this->applyKeywordSearch($query, $keyword))
            ->latest()
            ->get();
    }

    public function filter(array $filters): Collection
    {
        return $this->newPublicQuery()
            ->when(
                ($filters['category_id'] ?? null) || ($filters['legacy_category_name'] ?? null),
                fn ($query) => $this->applyResolvedCategoryFilter(
                    $query,
                    $filters['category_id'] ?? null,
                    $filters['legacy_category_name'] ?? null
                )
            )
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($filters['seller_id'] ?? null, function ($query, $sellerId) {
                $query->where('seller_id', (string) $sellerId);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['min_price'] ?? null, function ($query, $minPrice) {
                $query->where('price', '>=', (float) $minPrice);
            })
            ->when($filters['max_price'] ?? null, function ($query, $maxPrice) {
                $query->where('price', '<=', (float) $maxPrice);
            })
            ->latest()
            ->get();
    }

    public function getBySellerId(int|string $sellerId): Collection
    {
        return ProductDocument::query()
            ->where('seller_id', (string) $sellerId)
            ->latest()
            ->get();
    }

    public function findBySellerId(int|string $id, int|string $sellerId): ?ProductDocument
    {
        return ProductDocument::query()
            ->whereKey($id)
            ->where('seller_id', (string) $sellerId)
            ->first();
    }

    public function filterAll(array $filters): Collection
    {
        return ProductDocument::query()
            ->when(
                ($filters['category_id'] ?? null) || ($filters['legacy_category_name'] ?? null),
                fn ($query) => $this->applyResolvedCategoryFilter(
                    $query,
                    $filters['category_id'] ?? null,
                    $filters['legacy_category_name'] ?? null
                )
            )
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($filters['seller_id'] ?? null, function ($query, $sellerId) {
                $query->where('seller_id', (string) $sellerId);
            })
            ->latest()
            ->get();
    }

    public function getApprovedByCategory(int|string $categoryId, ?string $legacyCategoryName = null): Collection
    {
        return $this->newPublicQuery()
            ->where(function ($query) use ($categoryId, $legacyCategoryName) {
                $query->where('category_id', (int) $categoryId);

                if ($legacyCategoryName !== null && trim($legacyCategoryName) !== '') {
                    $query->orWhere('category', trim($legacyCategoryName));
                }
            })
            ->latest()
            ->get();
    }

    public function countByCategory(int|string $categoryId, ?string $legacyCategoryName = null): int
    {
        return ProductDocument::query()
            ->where(function ($query) use ($categoryId, $legacyCategoryName) {
                $query->where('category_id', (int) $categoryId);

                if ($legacyCategoryName !== null && trim($legacyCategoryName) !== '') {
                    $query->orWhere('category', trim($legacyCategoryName));
                }
            })
            ->count();
    }

    public function syncCategoryName(int|string $categoryId, string $categoryName): void
    {
        ProductDocument::query()
            ->where('category_id', (int) $categoryId)
            ->update([
                'category' => $categoryName,
            ]);
    }

    public function create(array $data): ProductDocument
    {
        return ProductDocument::create($data);
    }

    public function update($product, array $data): ProductDocument
    {
        $product->update($data);

        return $product->fresh();
    }

    public function delete($product): bool
    {
        return (bool) $product->delete();
    }

    private function newPublicQuery()
    {
        return ProductDocument::query()
            ->where('status', ProductDocument::STATUS_APPROVED);
    }

    private function applyKeywordSearch($query, string $keyword): void
    {
        $query->where(function ($nestedQuery) use ($keyword) {
            $nestedQuery->where('name', 'like', '%' . $keyword . '%')
                ->orWhere('description', 'like', '%' . $keyword . '%')
                ->orWhere('category', 'like', '%' . $keyword . '%');
        });
    }

    private function applyResolvedCategoryFilter($query, int|string|null $categoryId, ?string $legacyCategoryName): void
    {
        $normalizedLegacyName = is_string($legacyCategoryName) ? trim($legacyCategoryName) : null;

        $query->where(function ($nestedQuery) use ($categoryId, $normalizedLegacyName) {
            if ($categoryId !== null && $categoryId !== '') {
                $nestedQuery->where('category_id', (int) $categoryId);
            }

            if ($normalizedLegacyName !== null && $normalizedLegacyName !== '') {
                if ($categoryId !== null && $categoryId !== '') {
                    $nestedQuery->orWhere('category', $normalizedLegacyName);
                } else {
                    $nestedQuery->where('category', $normalizedLegacyName);
                }
            }
        });
    }
}
