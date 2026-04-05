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
        $result = $this->orderService->checkout($request->user(), $request->validated());

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse(
            $result['message'],
            $result['data'],
            $result['status_code']
        );
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
