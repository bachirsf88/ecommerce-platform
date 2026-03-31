<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {
    }

    public function checkout(User $buyer, array $data): ?Order
    {
        $cart = Cart::with(['items.product'])->where('user_id', $buyer->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return null;
        }

        $total = (float) $cart->items->sum('subtotal');

        $order = DB::transaction(function () use ($buyer, $data, $cart, $total) {
            $order = $this->orderRepository->createOrder([
                'buyer_id' => $buyer->id,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'shipping_address' => $data['shipping_address'],
                'status' => Order::STATUS_PENDING,
            ]);

            foreach ($cart->items as $item) {
                $this->orderRepository->createOrderItem([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'seller_id' => $item->product->seller_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ]);
            }

            $cart->items()->delete();

            return $order;
        });

        return $this->orderRepository->loadOrderRelations($order);
    }

    public function getBuyerOrders(User $buyer): Collection
    {
        return $this->orderRepository->getOrdersByBuyerId($buyer->id);
    }

    public function getBuyerOrderById(User $buyer, int|string $orderId): ?Order
    {
        return $this->orderRepository->findBuyerOrderById($buyer->id, $orderId);
    }
}
