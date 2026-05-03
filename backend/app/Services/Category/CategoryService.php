<?php

namespace App\Services\Category;

use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    use HandlesPublicFiles;

    public function __construct(
        private readonly CategoryRepositoryInterface $categoryRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getPublicCategories(): Collection
    {
        return $this->categoryRepository->getActive()
            ->map(fn (Category $category) => $this->formatCategory($category))
            ->values();
    }

    public function getPublicCategoryBySlug(string $slug): ?array
    {
        $category = $this->categoryRepository->findActiveBySlug($slug);

        if (! $category) {
            return null;
        }

        return $this->formatCategory($category, true);
    }

    public function getAdminCategories(): Collection
    {
        return $this->categoryRepository->getAll()
            ->map(fn (Category $category) => $this->formatCategory($category, true))
            ->values();
    }

    public function createCategory(array $data, ?UploadedFile $image = null): array
    {
        $payload = $this->prepareCategoryPayload($data, $image);

        return $this->formatCategory(
            $this->categoryRepository->create($payload),
            true
        );
    }

    public function updateCategory(Category $category, array $data, ?UploadedFile $image = null): array
    {
        $this->guardAgainstCircularParenting($category, $data['parent_id'] ?? null);

        $previousImage = $category->image;
        $payload = $this->prepareCategoryPayload($data, $image, $category);
        $updatedCategory = $this->categoryRepository->update($category, $payload);

        if ($image && $previousImage !== ($payload['image'] ?? null)) {
            $this->deletePublicFile($previousImage);
        }

        $this->syncProductsForCategory($updatedCategory);

        return $this->formatCategory($updatedCategory, true);
    }

    public function activateCategory(Category $category): array
    {
        $updatedCategory = $this->categoryRepository->update($category, [
            'status' => Category::STATUS_ACTIVE,
        ]);

        return $this->formatCategory($updatedCategory, true);
    }

    public function deactivateCategory(Category $category): array
    {
        $updatedCategory = $this->categoryRepository->update($category, [
            'status' => Category::STATUS_INACTIVE,
        ]);

        return $this->formatCategory($updatedCategory, true);
    }

    public function deleteCategory(Category $category): array
    {
        if ($category->children()->exists()) {
            return $this->failureResult('Delete child categories before deleting this category.');
        }

        if ($this->productRepository->countByCategory($category->id, $category->name) > 0) {
            return $this->failureResult('This category cannot be deleted because products still reference it.');
        }

        $image = $category->image;
        $deleted = $this->categoryRepository->delete($category);

        if ($deleted) {
            $this->deletePublicFile($image);
        }

        return [
            'success' => $deleted,
            'message' => $deleted
                ? 'Category deleted successfully.'
                : 'Category could not be deleted.',
            'status_code' => $deleted ? 200 : 422,
        ];
    }

    public function getApprovedProductsByCategorySlug(string $slug): ?EloquentCollection
    {
        $category = $this->categoryRepository->findActiveBySlug($slug);

        if (! $category) {
            return null;
        }

        return $this->productRepository->getApprovedByCategory($category->id, $category->name);
    }

    private function prepareCategoryPayload(
        array $data,
        ?UploadedFile $image = null,
        ?Category $existingCategory = null
    ): array {
        unset($data['image_url']);

        if ($image) {
            $data['image'] = $this->storePublicFile($image, 'categories');
        } elseif ($existingCategory) {
            $data['image'] = $existingCategory->image;
        }

        return $data;
    }

    private function syncProductsForCategory(Category $category): void
    {
        $this->productRepository->syncCategoryName($category->id, $category->name);
    }

    private function guardAgainstCircularParenting(Category $category, mixed $parentId): void
    {
        if ($parentId === null || $parentId === '') {
            return;
        }

        $parentCategory = $this->categoryRepository->findById((int) $parentId);

        while ($parentCategory) {
            if ((int) $parentCategory->id === (int) $category->id) {
                throw ValidationException::withMessages([
                    'parent_id' => ['A category cannot be assigned beneath one of its own descendants.'],
                ]);
            }

            $parentCategory = $parentCategory->parent;
        }
    }

    private function formatCategory(Category $category, bool $includeChildren = false): array
    {
        $children = $category->relationLoaded('children')
            ? $category->children
            : collect();

        if ($category->status === Category::STATUS_ACTIVE) {
            $children = $children->where('status', Category::STATUS_ACTIVE);
        }

        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'image_url' => $category->image_url,
            'parent_id' => $category->parent_id,
            'status' => $category->status,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
            'parent' => $category->parent ? [
                'id' => $category->parent->id,
                'name' => $category->parent->name,
                'slug' => $category->parent->slug,
                'status' => $category->parent->status,
            ] : null,
            'children_count' => $children->count(),
            'children' => $includeChildren
                ? $children->map(fn (Category $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                    'description' => $child->description,
                    'image' => $child->image,
                    'image_url' => $child->image_url,
                    'parent_id' => $child->parent_id,
                    'status' => $child->status,
                ])->values()->all()
                : [],
        ];
    }

    private function failureResult(string $message): array
    {
        return [
            'success' => false,
            'message' => $message,
            'status_code' => 422,
        ];
    }
}
