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
