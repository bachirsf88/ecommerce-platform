<?php

namespace App\Repositories\MongoDB;

use App\Models\Mongo\ProductDocument;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductMongoRepository implements ProductRepositoryInterface
{
    public function getAll(): Collection
    {
        return ProductDocument::latest()->get();
    }

    public function findById(int|string $id): ?ProductDocument
    {
        return ProductDocument::find($id);
    }

    public function search(?string $keyword): Collection
    {
        return ProductDocument::query()
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
        return ProductDocument::query()
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
}
