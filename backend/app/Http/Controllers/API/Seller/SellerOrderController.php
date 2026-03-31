<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Services\Order\SellerOrderService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SellerOrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly SellerOrderService $sellerOrderService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $orders = $this->sellerOrderService->getSellerOrders($request->user());

        return $this->successResponse('Seller orders fetched successfully.', $orders);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = $this->sellerOrderService->getSellerOrderById($request->user(), $id);

        if (! $order) {
            return $this->errorResponse('Order not found.', null, 404);
        }

        return $this->successResponse('Seller order fetched successfully.', $order);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                'pending',
                'confirmed',
                'shipped',
                'delivered',
                'cancelled',
            ])],
        ]);

        $order = $this->sellerOrderService->updateSellerOrderStatus(
            $request->user(),
            $id,
            $validated['status']
        );

        if (! $order) {
            return $this->errorResponse('Order not found or status is invalid.', null, 404);
        }

        return $this->successResponse('Order status updated successfully.', $order);
    }
}
