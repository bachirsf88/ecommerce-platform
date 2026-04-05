<?php

namespace App\Services\Product;

use App\Models\Mongo\ProductDocument;
use App\Models\User;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class ProductService
{
    use HandlesPublicFiles;

    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getAllProducts(): Collection
    {
        return $this->productRepository->getAll();
    }

    public function getProductById(int|string $id)
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

    public function createProduct(array $data)
    {
        return $this->productRepository->create($data);
    }

    public function createSellerProduct(array $data, User $seller, ?UploadedFile $imageFile = null)
    {
        unset($data['image_file'], $data['image'], $data['image_url']);

        $data['seller_id'] = (string) $seller->id;
        $data['status'] = $data['status'] ?? ProductDocument::STATUS_ACTIVE;
        $data['image'] = $this->resolvePersistedProductImage(null, $imageFile);

        return $this->productRepository->create($data);
    }

    public function updateProduct($product, array $data, User $seller, ?UploadedFile $imageFile = null)
    {
        if (! $this->ownsProduct($product, $seller)) {
            return null;
        }

        unset($data['image_file'], $data['image'], $data['image_url']);

        $previousImage = $product->image;
        $nextImage = $previousImage;

        if ($imageFile) {
            $nextImage = $this->resolvePersistedProductImage($previousImage, $imageFile);
            $data['image'] = $nextImage;
        }

        $updatedProduct = $this->productRepository->update($product, $data);

        if (
            $updatedProduct &&
            $previousImage !== $nextImage &&
            $this->normalizePublicPath($previousImage)
        ) {
            $this->deletePublicFile($previousImage);
        }

        return $updatedProduct;
    }

    public function deleteProduct($product, User $seller): bool
    {
        if (! $this->ownsProduct($product, $seller)) {
            return false;
        }

        $deleted = $this->productRepository->delete($product);

        if ($deleted) {
            $this->deletePublicFile($product->image);
        }

        return $deleted;
    }

    private function ownsProduct($product, User $seller): bool
    {
        return (string) $product->seller_id === (string) $seller->id;
    }

    private function resolvePersistedProductImage(?string $currentImage, ?UploadedFile $imageFile): ?string
    {
        if ($imageFile) {
            return $this->storePublicFile($imageFile, 'products');
        }

        return $currentImage;
    }
}
