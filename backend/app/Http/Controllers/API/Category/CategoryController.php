<?php

namespace App\Http\Controllers\API\Category;

use App\Http\Controllers\Controller;
use App\Services\Category\CategoryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
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
            $this->categoryService->getPublicCategories()
        );
    }

    public function show(string $slug): JsonResponse
    {
        $category = $this->categoryService->getPublicCategoryBySlug($slug);

        if (! $category) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        return $this->successResponse('Category fetched successfully.', $category);
    }

    public function products(string $slug): JsonResponse
    {
        $products = $this->categoryService->getApprovedProductsByCategorySlug($slug);

        if ($products === null) {
            return $this->errorResponse('Category not found.', null, 404);
        }

        return $this->successResponse('Category products fetched successfully.', $products);
    }
}
