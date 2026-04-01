<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository implements OrderRepositoryInterface
{
    public function createOrder(array $data): Order
    {
        return Order::create($data);
    }

    public function createOrderItem(array $data): void
    {
        OrderItem::create($data);
    }

    public function getOrdersByBuyerId(int|string $buyerId): Collection
    {
        return Order::with(['items.seller'])
            ->where('buyer_id', $buyerId)
            ->latest()
            ->get();
    }

    public function findBuyerOrderById(int|string $buyerId, int|string $orderId): ?Order
    {
        return Order::with(['items.seller'])
            ->where('buyer_id', $buyerId)
            ->find($orderId);
    }

    public function loadOrderRelations(Order $order): Order
    {
        return $order->load(['items.seller']);
    }

    public function getOrdersBySellerId(int|string $sellerId): Collection
    {
        return Order::with(['items.seller', 'buyer'])
            ->whereHas('items', function ($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->latest()
            ->get();
    }

    public function findSellerOrderById(int|string $sellerId, int|string $orderId): ?Order
    {
        return Order::with(['items.seller', 'buyer'])
            ->whereHas('items', function ($query) use ($sellerId) {
                $query->where('seller_id', $sellerId);
            })
            ->find($orderId);
    }

    public function updateOrder(Order $order, array $data): Order
    {
        $order->update($data);

        return $order->refresh();
    }
}
