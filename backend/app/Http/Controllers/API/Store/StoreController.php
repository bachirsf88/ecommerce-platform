<?php

namespace App\Http\Controllers\API\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\UpdateSellerStoreRequest;
use App\Services\Store\StoreService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly StoreService $storeService
    ) {
    }

    public function show(string $id): JsonResponse
    {
        $store = $this->storeService->getPublicStoreById($id);

        if (! $store) {
            return $this->errorResponse('Store not found.', null, 404);
        }

        return $this->successResponse('Store fetched successfully.', $store);
    }

    public function showBySeller(string $sellerId): JsonResponse
    {
        $store = $this->storeService->getPublicStoreBySellerId($sellerId);

        if (! $store) {
            return $this->errorResponse('Store not found.', null, 404);
        }

        return $this->successResponse('Store fetched successfully.', $store);
    }

    public function showMine(Request $request): JsonResponse
    {
        $store = $this->storeService->getSellerStore($request->user());

        if (! $store) {
            return $this->errorResponse('Store not found.', null, 404);
        }

        return $this->successResponse('Seller store fetched successfully.', $store);
    }

    public function updateMine(UpdateSellerStoreRequest $request): JsonResponse
    {
        $store = $this->storeService->updateSellerStore(
            $request->user(),
            $request->validated(),
            $request->file('logo'),
            $request->file('banner')
        );

        return $this->successResponse('Store updated successfully.', $store);
    }
}
