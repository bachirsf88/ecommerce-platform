<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Interfaces\CartRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function __construct(
        private readonly CartRepositoryInterface $cartRepository
    ) {
    }

    public function getCart(User $user): array
    {
        $cart = $this->cartRepository->getOrCreateCartByUserId($user->id);

        return $this->formatCart($cart);
    }

    public function addToCart(User $user, array $data): ?array
    {
        $product = Product::find($data['product_id']);

        if (! $product) {
            return null;
        }

        DB::transaction(function () use ($user, $data, $product) {
            $cart = $this->cartRepository->getOrCreateCartByUserId($user->id);
            $cartItem = $this->cartRepository->findCartItemByCartAndProduct($cart, $product->id);

            if ($cartItem) {
                $quantity = $cartItem->quantity + $data['quantity'];

                $this->cartRepository->updateCartItem($cartItem, [
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'subtotal' => $quantity * $product->price,
                ]);

                return;
            }

            $this->cartRepository->createCartItem([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'unit_price' => $product->price,
                'subtotal' => $data['quantity'] * $product->price,
            ]);
        });

        $cart = $this->cartRepository->getOrCreateCartByUserId($user->id);

        return $this->formatCart($cart);
    }

    public function updateCartItem(User $user, int|string $cartItemId, array $data): ?array
    {
        $cartItem = $this->cartRepository->findCartItemById($cartItemId);

        if (! $cartItem || ! $this->ownsCartItem($cartItem, $user)) {
            return null;
        }

        $this->cartRepository->updateCartItem($cartItem, [
            'quantity' => $data['quantity'],
            'subtotal' => $data['quantity'] * $cartItem->unit_price,
        ]);

        $cart = $this->cartRepository->getOrCreateCartByUserId($user->id);

        return $this->formatCart($cart);
    }

    public function removeCartItem(User $user, int|string $cartItemId): ?array
    {
        $cartItem = $this->cartRepository->findCartItemById($cartItemId);

        if (! $cartItem || ! $this->ownsCartItem($cartItem, $user)) {
            return null;
        }

        $this->cartRepository->deleteCartItem($cartItem);

        $cart = $this->cartRepository->getOrCreateCartByUserId($user->id);

        return $this->formatCart($cart);
    }

    private function ownsCartItem(CartItem $cartItem, User $user): bool
    {
        return (string) $cartItem->cart->user_id === (string) $user->id;
    }

    private function formatCart(Cart $cart): array
    {
        $items = $cart->items->map(function (CartItem $item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $item->product,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ];
        })->values();

        return [
            'id' => $cart->id,
            'user_id' => $cart->user_id,
            'items' => $items,
            'total' => (float) $items->sum('subtotal'),
        ];
    }
}
