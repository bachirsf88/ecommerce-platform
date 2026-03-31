<?php

namespace App\Http\Controllers\API\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CheckoutRequest;
use App\Services\Order\OrderService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly OrderService $orderService
    ) {
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $order = $this->orderService->checkout($request->user(), $request->validated());

        if (! $order) {
            return $this->errorResponse('Cart is empty.', null, 400);
        }

        return $this->successResponse('Checkout completed successfully.', $order, 201);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getBuyerOrders($request->user());

        return $this->successResponse('Orders fetched successfully.', $orders);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = $this->orderService->getBuyerOrderById($request->user(), $id);

        if (! $order) {
            return $this->errorResponse('Order not found.', null, 404);
        }

        return $this->successResponse('Order fetched successfully.', $order);
    }
}
