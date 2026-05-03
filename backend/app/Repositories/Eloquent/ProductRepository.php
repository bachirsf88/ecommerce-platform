<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAll(): Collection
    {
        return Product::latest()->get();
    }

    public function findById(int|string $id)
    {
        return Product::find($id);
    }

    public function findApprovedById(int|string $id)
    {
        return Product::query()
            ->whereKey($id)
            ->where('status', Product::STATUS_ACTIVE)
            ->first();
    }

    public function search(?string $keyword): Collection
    {
        return Product::query()
            ->when($keyword, function ($query, $keyword) {
                $query->where('name', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%')
                    ->orWhere('category', 'like', '%' . $keyword . '%');
            })
            ->latest()
            ->get();
    }

    public function filter(array $filters): Collection
    {
        return Product::query()
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($filters['seller_id'] ?? null, function ($query, $sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['min_price'] ?? null, function ($query, $minPrice) {
                $query->where('price', '>=', $minPrice);
            })
            ->when($filters['max_price'] ?? null, function ($query, $maxPrice) {
                $query->where('price', '<=', $maxPrice);
            })
            ->latest()
            ->get();
    }

    public function getBySellerId(int|string $sellerId): Collection
    {
        return Product::query()
            ->where('seller_id', $sellerId)
            ->latest()
            ->get();
    }

    public function findBySellerId(int|string $id, int|string $sellerId)
    {
        return Product::query()
            ->whereKey($id)
            ->where('seller_id', $sellerId)
            ->first();
    }

    public function filterAll(array $filters): Collection
    {
        return Product::query()
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($filters['seller_id'] ?? null, function ($query, $sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->get();
    }

    public function getApprovedByCategory(int|string $categoryId, ?string $legacyCategoryName = null): Collection
    {
        return Product::query()
            ->where('status', Product::STATUS_ACTIVE)
            ->where(function ($query) use ($categoryId, $legacyCategoryName) {
                $query->where('category_id', $categoryId);

                if ($legacyCategoryName !== null && trim($legacyCategoryName) !== '') {
                    $query->orWhere('category', trim($legacyCategoryName));
                }
            })
            ->latest()
            ->get();
    }

    public function countByCategory(int|string $categoryId, ?string $legacyCategoryName = null): int
    {
        return Product::query()
            ->where(function ($query) use ($categoryId, $legacyCategoryName) {
                $query->where('category_id', $categoryId);

                if ($legacyCategoryName !== null && trim($legacyCategoryName) !== '') {
                    $query->orWhere('category', trim($legacyCategoryName));
                }
            })
            ->count();
    }

    public function syncCategoryName(int|string $categoryId, string $categoryName): void
    {
        Product::query()
            ->where('category_id', $categoryId)
            ->update([
                'category' => $categoryName,
            ]);
    }

    public function create(array $data)
    {
        return Product::create($data);
    }

    public function update($product, array $data)
    {
        $product->update($data);

        return $product->fresh();
    }

    public function delete($product): bool
    {
        return (bool) $product->delete();
    }
}
