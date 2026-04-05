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
    private const SHIPPING_COSTS = [
        'home_delivery' => 300,
        'office_pickup' => 150,
    ];

    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function checkout(User $buyer, array $data): array
    {
        $cart = Cart::with('items')->where('user_id', $buyer->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return $this->failureResult('Cart is empty.', 400);
        }

        $products = collect();

        foreach ($cart->items as $item) {
            $product = $this->productRepository->findById($item->product_id);

            if (! $product) {
                return $this->failureResult('A product in your cart could not be found.', 404);
            }

            if (($product->status ?? null) !== 'active') {
                return $this->failureResult(
                    sprintf('Product unavailable for checkout: %s', $product->name ?? 'Unknown product'),
                    422
                );
            }

            if ((int) $item->quantity > (int) ($product->stock ?? 0)) {
                return $this->failureResult(
                    sprintf('Insufficient stock for product: %s', $product->name ?? 'Unknown product'),
                    422
                );
            }

            $products->put((string) $item->product_id, $product);
        }

        $subtotal = (float) $cart->items->sum('subtotal');
        $shippingCost = $this->resolveShippingCost($data['shipping_method']);
        $total = $subtotal + $shippingCost;

        $order = DB::transaction(function () use ($buyer, $data, $cart, $products, $shippingCost, $total) {
            $order = $this->orderRepository->createOrder([
                'buyer_id' => $buyer->id,
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'country' => $data['country'],
                'state' => $data['state'],
                'municipality' => $data['municipality'],
                'neighborhood' => $data['neighborhood'],
                'street_address' => $data['street_address'],
                'notes' => $data['notes'] ?? null,
                'shipping_method' => $data['shipping_method'],
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'shipping_address' => $this->buildShippingAddress($data),
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

        return [
            'success' => true,
            'message' => 'Checkout completed successfully.',
            'status_code' => 201,
            'data' => $this->attachProductsToOrder(
                $this->orderRepository->loadOrderRelations($order)
            ),
        ];
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

    private function resolveShippingCost(string $shippingMethod): float
    {
        return (float) (self::SHIPPING_COSTS[$shippingMethod] ?? 0);
    }

    private function buildShippingAddress(array $data): string
    {
        return implode(', ', array_filter([
            $data['street_address'] ?? null,
            $data['neighborhood'] ?? null,
            $data['municipality'] ?? null,
            $data['state'] ?? null,
            $data['country'] ?? null,
        ]));
    }

    private function failureResult(string $message, int $statusCode): array
    {
        return [
            'success' => false,
            'message' => $message,
            'status_code' => $statusCode,
        ];
    }
}
