<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class SellerOrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
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

    public function updateSellerOrderStatus(User $seller, int|string $orderId, ?string $status): array
    {
        if (! in_array($status, Order::STATUSES, true)) {
            return $this->failureResult('Order status is invalid.', 422);
        }

        $order = $this->orderRepository->findSellerOrderById($seller->id, $orderId);

        if (! $order) {
            return $this->failureResult('Order not found.', 404);
        }

        $currentStatus = $order->status;

        if ($currentStatus === Order::STATUS_DELIVERED && $status === Order::STATUS_DELIVERED) {
            return $this->failureResult('Order already delivered.', 409);
        }

        $isDelivering =
            $currentStatus !== Order::STATUS_DELIVERED
            && $status === Order::STATUS_DELIVERED;

        DB::beginTransaction();

        try {
            if ($isDelivering) {
                $stockCheck = $this->ensureDeliverableStock($order);

                if (! $stockCheck['success']) {
                    DB::rollBack();

                    return $stockCheck;
                }
            }

            $updatedOrder = $this->orderRepository->updateOrder($order, [
                'status' => $status,
            ]);

            if ($isDelivering) {
                $stockReduction = $this->reduceDeliveredOrderStock($updatedOrder);

                if (! $stockReduction['success']) {
                    DB::rollBack();

                    return $stockReduction;
                }
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }

        return [
            'success' => true,
            'message' => 'Order status updated successfully.',
            'status_code' => 200,
            'data' => $this->formatSellerOrder(
                $this->orderRepository->loadOrderRelations($updatedOrder->load('buyer')),
                $seller
            ),
        ];
    }

    private function formatSellerOrder(Order $order, User $seller): Order
    {
        $sellerItems = $order->items
            ->where('seller_id', $seller->id)
            ->values();

        $sellerItems->each(function ($item) {
            $product = $this->productRepository->findById($item->product_id);
            $item->setRelation('product', $product);
        });

        $order->setRelation('items', $sellerItems);
        $order->setAttribute('seller_total', (float) $sellerItems->sum('subtotal'));

        return $order;
    }

    private function ensureDeliverableStock(Order $order): array
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $product = $this->productRepository->findById($item->product_id);

            if (! $product) {
                return $this->failureResult(
                    sprintf('Product not found for order item: %s', (string) $item->product_id),
                    404
                );
            }

            if ((int) ($product->stock ?? 0) < (int) $item->quantity) {
                return $this->failureResult(
                    sprintf('Insufficient stock for product: %s', $product->name ?? 'Unknown product'),
                    422
                );
            }
        }

        return ['success' => true];
    }

    private function reduceDeliveredOrderStock(Order $order): array
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $product = $this->productRepository->findById($item->product_id);

            if (! $product) {
                return $this->failureResult(
                    sprintf('Product not found for order item: %s', (string) $item->product_id),
                    404
                );
            }

            if ((int) ($product->stock ?? 0) < (int) $item->quantity) {
                return $this->failureResult(
                    sprintf('Insufficient stock for product: %s', $product->name ?? 'Unknown product'),
                    422
                );
            }

            $nextStock = max(0, (int) ($product->stock ?? 0) - (int) $item->quantity);

            $updatedProduct = $this->productRepository->update($product, [
                'stock' => $nextStock,
            ]);

            if (! $updatedProduct) {
                return $this->failureResult(
                    sprintf('Unable to update stock for product: %s', $product->name ?? 'Unknown product'),
                    500
                );
            }
        }

        return ['success' => true];
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
