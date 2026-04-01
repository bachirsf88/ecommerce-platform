<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function checkout(User $buyer, array $data): ?Order
    {
        $cart = Cart::with('items')->where('user_id', $buyer->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return null;
        }

        $products = collect();

        foreach ($cart->items as $item) {
            $product = $this->productRepository->findById($item->product_id);

            if (! $product) {
                return null;
            }

            if (($product->status ?? null) !== 'active') {
                return null;
            }

            $products->put((string) $item->product_id, $product);
        }

        $total = (float) $cart->items->sum('subtotal');

        $order = DB::transaction(function () use ($buyer, $data, $cart, $products, $total) {
            $order = $this->orderRepository->createOrder([
                'buyer_id' => $buyer->id,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'shipping_address' => $data['shipping_address'],
                'status' => Order::STATUS_PENDING,
            ]);

            foreach ($cart->items as $item) {
                $product = $products->get((string) $item->product_id);

                $this->orderRepository->createOrderItem([
                    'order_id' => $order->id,
                    'product_id' => (string) $item->product_id,
                    'seller_id' => $product->seller_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ]);
            }

            $cart->items()->delete();

            return $order;
        });

        return $this->attachProductsToOrder(
            $this->orderRepository->loadOrderRelations($order)
        );
    }

    public function getBuyerOrders(User $buyer): Collection
    {
        return $this->attachProductsToOrders(
            $this->orderRepository->getOrdersByBuyerId($buyer->id)
        );
    }

    public function getBuyerOrderById(User $buyer, int|string $orderId): ?Order
    {
        $order = $this->orderRepository->findBuyerOrderById($buyer->id, $orderId);

        if (! $order) {
            return null;
        }

        return $this->attachProductsToOrder($order);
    }

    private function attachProductsToOrders(Collection $orders): Collection
    {
        return $orders->map(fn (Order $order) => $this->attachProductsToOrder($order));
    }

    private function attachProductsToOrder(Order $order): Order
    {
        $order->items->each(function ($item) {
            $product = $this->productRepository->findById($item->product_id);
            $item->setRelation('product', $product);
        });

        return $order;
    }
}
