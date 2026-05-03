<?php

namespace App\Services\Product;

use App\Models\Category;
use App\Models\Mongo\ProductDocument;
use App\Models\User;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ProductService
{
    use HandlesPublicFiles;

    public function __construct(
        private readonly ProductRepositoryInterface $productRepository,
        private readonly CategoryRepositoryInterface $categoryRepository
    ) {
    }

    public function getAllProducts(): Collection
    {
        return $this->productRepository->getAll();
    }

    public function getPublicProductById(int|string $id)
    {
        return $this->productRepository->findApprovedById($id);
    }

    public function getProductById(int|string $id)
    {
        return $this->productRepository->findById($id);
    }

    public function getSellerProducts(User $seller): Collection
    {
        return $this->productRepository->getBySellerId((string) $seller->id);
    }

    public function getSellerProductById(int|string $id, User $seller)
    {
        return $this->productRepository->findBySellerId($id, (string) $seller->id);
    }

    public function searchProducts(?string $keyword): Collection
    {
        return $this->productRepository->search($keyword);
    }

    public function filterProducts(array $filters): Collection
    {
        $filters = $this->resolveCategoryFilters($filters);

        if (($filters['category_filter_invalid'] ?? false) === true) {
            return new Collection();
        }

        unset($filters['category_filter_invalid']);

        return $this->productRepository->filter($filters);
    }

    public function createProduct(array $data)
    {
        return $this->productRepository->create($data);
    }

    /**
     * @param  UploadedFile[]  $imageFiles
     */
    public function createSellerProduct(
        array $data,
        User $seller,
        array $imageFiles = []
    )
    {
        $data = $this->prepareSellerProductPayload($data, $seller);
        $storedImages = $this->storeProductImages($imageFiles);

        if ($storedImages !== []) {
            $data['images'] = $storedImages;
            $data['image'] = $storedImages[0];
        }

        return $this->productRepository->create($data);
    }

    /**
     * @param  UploadedFile[]  $imageFiles
     */
    public function updateProduct(
        $product,
        array $data,
        User $seller,
        array $imageFiles = []
    )
    {
        if (! $this->ownsProduct($product, $seller)) {
            return null;
        }

        $data = $this->prepareSellerProductPayload($data, $seller, $product);

        $previousImages = $this->resolvePersistedProductImages($product);
        if ($imageFiles !== []) {
            $nextImages = $this->storeProductImages($imageFiles);
            $data['images'] = $nextImages;
            $data['image'] = $nextImages[0] ?? null;
        }

        $updatedProduct = $this->productRepository->update($product, $data);

        if (! $updatedProduct) {
            return $updatedProduct;
        }

        if ($imageFiles !== []) {
            $this->deletePublicFiles($previousImages);
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
            $this->deletePublicFiles($this->resolvePersistedProductImages($product));
            $this->deletePublicFile($product->video);
        }

        return $deleted;
    }

    private function ownsProduct($product, User $seller): bool
    {
        return (string) $product->seller_id === (string) $seller->id;
    }

    private function prepareSellerProductPayload(array $data, User $seller, $existingProduct = null): array
    {
        $category = $this->resolveActiveCategoryOrFail($data['category_id'] ?? null);

        unset(
            $data['category'],
            $data['image_file'],
            $data['image_files'],
            $data['image'],
            $data['image_url'],
            $data['image_urls'],
            $data['video'],
            $data['video_url'],
            $data['video_file'],
            $data['status']
        );

        $data['seller_id'] = (string) $seller->id;
        $data['category_id'] = $category->id;
        $data['category'] = $category->name;
        $data['status'] = $this->resolveSellerManagedStatus($existingProduct);

        return $data;
    }

    private function resolveSellerManagedStatus($existingProduct = null): string
    {
        if (! $existingProduct) {
            return ProductDocument::STATUS_APPROVED;
        }

        if (($existingProduct->status ?? null) === ProductDocument::STATUS_INACTIVE) {
            return ProductDocument::STATUS_INACTIVE;
        }

        return ProductDocument::STATUS_APPROVED;
    }

    private function resolveActiveCategoryOrFail(mixed $categoryId): Category
    {
        $normalizedCategoryId = is_numeric($categoryId) ? (int) $categoryId : null;
        $category = $normalizedCategoryId !== null
            ? $this->categoryRepository->findActiveById($normalizedCategoryId)
            : null;

        if (! $category) {
            throw ValidationException::withMessages([
                'category_id' => ['Selected category is invalid or inactive.'],
            ]);
        }

        return $category;
    }

    private function resolveCategoryFilters(array $filters): array
    {
        if (($filters['category_slug'] ?? null) !== null) {
            $category = $this->categoryRepository->findActiveBySlug((string) $filters['category_slug']);

            if (! $category) {
                return [
                    ...$filters,
                    'category_filter_invalid' => true,
                ];
            }

            return [
                ...$filters,
                'category_id' => $category->id,
                'legacy_category_name' => $category->name,
            ];
        }

        if (($filters['category_id'] ?? null) !== null && $filters['category_id'] !== '') {
            $category = $this->categoryRepository->findActiveById((int) $filters['category_id']);

            if (! $category) {
                return [
                    ...$filters,
                    'category_filter_invalid' => true,
                ];
            }

            return [
                ...$filters,
                'category_id' => $category->id,
                'legacy_category_name' => $category->name,
            ];
        }

        return $filters;
    }

    /**
     * @param  UploadedFile[]  $imageFiles
     * @return string[]
     */
    private function storeProductImages(array $imageFiles): array
    {
        $normalizedFiles = array_values(array_filter(
            $imageFiles,
            fn ($file) => $file instanceof UploadedFile
        ));

        if ($normalizedFiles === []) {
            return [];
        }

        $primaryImage = array_shift($normalizedFiles);
        $galleryImages = $this->storePublicFiles($normalizedFiles, 'products/gallery');

        return array_values(array_filter([
            $primaryImage ? $this->storePublicFile($primaryImage, 'products') : null,
            ...$galleryImages,
        ]));
    }

    /**
     * @return string[]
     */
    private function resolvePersistedProductImages($product): array
    {
        $galleryImages = collect($product->images ?? [])
            ->filter(fn ($value) => is_string($value) && trim($value) !== '');

        $primaryImage = is_string($product->image ?? null) ? trim($product->image) : null;

        if ($primaryImage) {
            $galleryImages = $galleryImages->prepend($primaryImage);
        }

        return $galleryImages
            ->unique()
            ->values()
            ->all();
    }
}
