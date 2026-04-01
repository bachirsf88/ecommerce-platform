<?php

namespace App\Repositories\Eloquent;

use App\Models\Cart;
use App\Models\CartItem;
use App\Repositories\Interfaces\CartRepositoryInterface;

class CartRepository implements CartRepositoryInterface
{
    public function getOrCreateCartByUserId(int|string $userId): Cart
    {
        $cart = Cart::firstOrCreate([
            'user_id' => $userId,
        ]);

        return $this->loadCartRelations($cart);
    }

    public function getCartByUserId(int|string $userId): ?Cart
    {
        $cart = Cart::where('user_id', $userId)->first();

        if (! $cart) {
            return null;
        }

        return $this->loadCartRelations($cart);
    }

    public function findCartItemById(int|string $id): ?CartItem
    {
        return CartItem::with('cart')->find($id);
    }

    public function findCartItemByCartAndProduct(Cart $cart, int|string $productId): ?CartItem
    {
        return CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();
    }

    public function createCartItem(array $data): CartItem
    {
        return CartItem::create($data);
    }

    public function updateCartItem(CartItem $cartItem, array $data): CartItem
    {
        $cartItem->update($data);

        return $cartItem->fresh(['cart']);
    }

    public function deleteCartItem(CartItem $cartItem): bool
    {
        return (bool) $cartItem->delete();
    }

    public function loadCartRelations(Cart $cart): Cart
    {
        return $cart->load('items');
    }
}
