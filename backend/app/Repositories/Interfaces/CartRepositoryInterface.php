<?php

namespace App\Repositories\Interfaces;

use App\Models\Cart;
use App\Models\CartItem;

interface CartRepositoryInterface
{
    public function getOrCreateCartByUserId(int|string $userId): Cart;

    public function getCartByUserId(int|string $userId): ?Cart;

    public function findCartItemById(int|string $id): ?CartItem;

    public function findCartItemByCartAndProduct(Cart $cart, int|string $productId): ?CartItem;

    public function createCartItem(array $data): CartItem;

    public function updateCartItem(CartItem $cartItem, array $data): CartItem;

    public function deleteCartItem(CartItem $cartItem): bool;

    public function loadCartRelations(Cart $cart): Cart;
}
