<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SellerOrderService
{
    private const ALLOWED_STATUSES = [
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
    ];

    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {
    }

    public function getSellerOrders(User $seller): Collection
    {
        $orders = $this->orderRepository->getOrdersBySellerId($seller->id);

        return $orders->map(function (Order $order) use ($seller) {
            return $this->formatSellerOrder($order, $seller);
        });
    }

    public function getSellerOrderById(User $seller, int|string $orderId): ?Order
    {
        $order = $this->orderRepository->findSellerOrderById($seller->id, $orderId);

        if (! $order) {
            return null;
        }

        return $this->formatSellerOrder($order, $seller);
    }

    public function updateSellerOrderStatus(User $seller, int|string $orderId, ?string $status): ?Order
    {
        if (! in_array($status, self::ALLOWED_STATUSES, true)) {
            return null;
        }

        $order = $this->orderRepository->findSellerOrderById($seller->id, $orderId);

        if (! $order) {
            return null;
        }

        $updatedOrder = $this->orderRepository->updateOrder($order, [
            'status' => $status,
        ]);

        return $this->formatSellerOrder(
            $this->orderRepository->loadOrderRelations($updatedOrder->load('buyer')),
            $seller
        );
    }

    private function formatSellerOrder(Order $order, User $seller): Order
    {
        $sellerItems = $order->items
            ->where('seller_id', $seller->id)
            ->values();

        $order->setRelation('items', $sellerItems);
        $order->setAttribute('seller_total', (float) $sellerItems->sum('subtotal'));

        return $order;
    }
}
