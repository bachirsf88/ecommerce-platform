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

    /**
     * @param  UploadedFile[]  $imageFiles
     */
    public function createSellerProduct(
        array $data,
        User $seller,
        array $imageFiles = [],
        ?UploadedFile $videoFile = null
    )
    {
        unset(
            $data['image_file'],
            $data['image_files'],
            $data['image'],
            $data['image_url'],
            $data['image_urls'],
            $data['video'],
            $data['video_url'],
            $data['video_file']
        );

        $data['seller_id'] = (string) $seller->id;
        $data['status'] = $data['status'] ?? ProductDocument::STATUS_ACTIVE;
        $storedImages = $this->storeProductImages($imageFiles);

        if ($storedImages !== []) {
            $data['images'] = $storedImages;
            $data['image'] = $storedImages[0];
        }

        if ($videoFile) {
            $data['video'] = $this->storeProductVideo($videoFile);
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
        array $imageFiles = [],
        ?UploadedFile $videoFile = null
    )
    {
        if (! $this->ownsProduct($product, $seller)) {
            return null;
        }

        unset(
            $data['image_file'],
            $data['image_files'],
            $data['image'],
            $data['image_url'],
            $data['image_urls'],
            $data['video'],
            $data['video_url'],
            $data['video_file']
        );

        $previousImages = $this->resolvePersistedProductImages($product);
        $previousVideo = $product->video;

        if ($imageFiles !== []) {
            $nextImages = $this->storeProductImages($imageFiles);
            $data['images'] = $nextImages;
            $data['image'] = $nextImages[0] ?? null;
        }

        if ($videoFile) {
            $data['video'] = $this->storeProductVideo($videoFile);
        }

        $updatedProduct = $this->productRepository->update($product, $data);

        if (! $updatedProduct) {
            return $updatedProduct;
        }

        if ($imageFiles !== []) {
            $this->deletePublicFiles($previousImages);
        }

        if ($videoFile && $previousVideo !== ($data['video'] ?? null)) {
            $this->deletePublicFile($previousVideo);
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

    /**
     * @param  UploadedFile[]  $imageFiles
     * @return string[]
     */
    private function storeProductImages(array $imageFiles): array
    {
        return $this->storePublicFiles($imageFiles, 'products/images');
    }

    private function storeProductVideo(UploadedFile $videoFile): string
    {
        return $this->storePublicFile($videoFile, 'products/videos');
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
