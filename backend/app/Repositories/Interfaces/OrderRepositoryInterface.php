<?php

namespace App\Repositories\Interfaces;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

interface OrderRepositoryInterface
{
    public function createOrder(array $data): Order;

    public function createOrderItem(array $data): void;

    public function getOrdersByBuyerId(int|string $buyerId): Collection;

    public function findBuyerOrderById(int|string $buyerId, int|string $orderId): ?Order;

    public function loadOrderRelations(Order $order): Order;

    public function getOrdersBySellerId(int|string $sellerId): Collection;

    public function findSellerOrderById(int|string $sellerId, int|string $orderId): ?Order;

    public function updateOrder(Order $order, array $data): Order;
}
