<?php

namespace App\Http\Controllers\API\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Services\Cart\CartService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly CartService $cartService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user());

        return $this->successResponse('Cart fetched successfully.', $cart);
    }

    public function add(AddToCartRequest $request): JsonResponse
    {
        $cart = $this->cartService->addToCart($request->user(), $request->validated());

        if (! $cart) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        return $this->successResponse('Product added to cart successfully.', $cart);
    }

    public function updateItem(UpdateCartItemRequest $request, string $id): JsonResponse
    {
        $cart = $this->cartService->updateCartItem(
            $request->user(),
            $id,
            $request->validated()
        );

        if (! $cart) {
            return $this->errorResponse('Cart item not found or access denied.', null, 404);
        }

        return $this->successResponse('Cart item updated successfully.', $cart);
    }

    public function removeItem(Request $request, string $id): JsonResponse
    {
        $cart = $this->cartService->removeCartItem($request->user(), $id);

        if (! $cart) {
            return $this->errorResponse('Cart item not found or access denied.', null, 404);
        }

        return $this->successResponse('Cart item removed successfully.', $cart);
    }
}
