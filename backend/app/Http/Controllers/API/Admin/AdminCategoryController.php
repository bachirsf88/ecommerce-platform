<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\Category\CategoryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class AdminCategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CategoryService $categoryService
    ) {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse(
            'Categories fetched successfully.',
            $this->categoryService->getAdminCategories()
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory(
            $request->validated(),
            $request->file('image')
        );

        return $this->successResponse('Category created successfully.', $category, 201);
    }

    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        $updatedCategory = $this->categoryService->updateCategory(
            $category,
            $request->validated(),
            $request->file('image')
        );

        return $this->successResponse('Category updated successfully.', $updatedCategory);
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        $result = $this->categoryService->deleteCategory($category);

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse($result['message'], null, $result['status_code']);
    }

    public function activate(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        return $this->successResponse(
            'Category activated successfully.',
            $this->categoryService->activateCategory($category)
        );
    }

    public function deactivate(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        return $this->successResponse(
            'Category deactivated successfully.',
            $this->categoryService->deactivateCategory($category)
        );
    }
}
