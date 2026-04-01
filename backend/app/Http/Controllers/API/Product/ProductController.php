<?php

namespace App\Http\Controllers\API\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Services\Product\ProductService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ProductService $productService
    ) {
    }

    public function index(): JsonResponse
    {
        $products = $this->productService->getAllProducts();

        return $this->successResponse('Products fetched successfully.', $products);
    }

    public function show(string $id): JsonResponse
    {
        $product = $this->productService->getProductById($id);

        if (! $product) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        return $this->successResponse('Product fetched successfully.', $product);
    }

    public function search(Request $request): JsonResponse
    {
        $products = $this->productService->searchProducts($request->query('keyword'));

        return $this->successResponse('Search results fetched successfully.', $products);
    }

    public function filter(Request $request): JsonResponse
    {
        $products = $this->productService->filterProducts($request->only([
            'category',
            'status',
            'min_price',
            'max_price',
        ]));

        return $this->successResponse('Filtered products fetched successfully.', $products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createSellerProduct(
            $request->validated(),
            $request->user()
        );

        return $this->successResponse('Product created successfully.', $product, 201);
    }

    public function update(UpdateProductRequest $request, string $product): JsonResponse
    {
        $existingProduct = $this->productService->getProductById($product);

        if (! $existingProduct) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        $updatedProduct = $this->productService->updateProduct(
            $existingProduct,
            $request->validated(),
            $request->user()
        );

        if (! $updatedProduct) {
            return $this->errorResponse('You can only update your own products.', null, 403);
        }

        return $this->successResponse('Product updated successfully.', $updatedProduct);
    }

    public function destroy(Request $request, string $product): JsonResponse
    {
        $existingProduct = $this->productService->getProductById($product);

        if (! $existingProduct) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        $deleted = $this->productService->deleteProduct($existingProduct, $request->user());

        if (! $deleted) {
            return $this->errorResponse('You can only delete your own products.', null, 403);
        }

        return $this->successResponse('Product deleted successfully.');
    }
}
