<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\User;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getAllProducts(): Collection
    {
        return $this->productRepository->getAll();
    }

    public function getProductById(int|string $id): ?Product
    {
        return $this->productRepository->findById($id);
    }

    public function searchProducts(?string $keyword): Collection
    {
        return $this->productRepository->search($keyword);
    }

    public function filterProducts(array $filters): Collection
    {
        return $this->productRepository->filter($filters);
    }

    public function createProduct(array $data, User $seller): Product
    {
        $data['seller_id'] = $seller->id;
        $data['status'] = $data['status'] ?? Product::STATUS_ACTIVE;

        return $this->productRepository->create($data);
    }

    public function updateProduct(Product $product, array $data, User $seller): ?Product
    {
        if (! $this->ownsProduct($product, $seller)) {
            return null;
        }

        return $this->productRepository->update($product, $data);
    }

    public function deleteProduct(Product $product, User $seller): bool
    {
        if (! $this->ownsProduct($product, $seller)) {
            return false;
        }

        return $this->productRepository->delete($product);
    }

    private function ownsProduct(Product $product, User $seller): bool
    {
        return (string) $product->seller_id === (string) $seller->id;
    }
}
