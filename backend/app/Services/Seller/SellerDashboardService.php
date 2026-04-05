<?php

namespace App\Services\Seller;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;

class SellerDashboardService
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getDashboard(User $seller): array
    {
        $products = $this->productRepository->filter([
            'seller_id' => $seller->id,
        ]);

        $orders = $this->orderRepository->getOrdersBySellerId($seller->id);
        $lowStockProducts = $products
            ->filter(fn ($product) => (int) ($product->stock ?? 0) <= self::LOW_STOCK_THRESHOLD)
            ->values();

        $deliveredOrders = $orders->where('status', Order::STATUS_DELIVERED);
        $pendingOrProcessingOrders = $orders
            ->filter(fn (Order $order) => in_array($order->status, [
                Order::STATUS_PENDING,
                Order::STATUS_PROCESSING,
            ], true))
            ->values();

        return [
            'store_name' => $seller->store?->store_name,
            'overview' => [
                'total_products' => $products->count(),
                'total_orders' => $orders->count(),
                'low_stock_products' => $lowStockProducts->count(),
                'delivered_orders' => $deliveredOrders->count(),
                'pending_processing_orders' => $pendingOrProcessingOrders->count(),
            ],
            'financial_summary' => [
                'delivered_revenue' => $this->sumSellerOrderTotals($deliveredOrders, $seller),
                'pending_revenue' => $this->sumSellerOrderTotals($pendingOrProcessingOrders, $seller),
            ],
            'recent_orders' => $orders
                ->take(6)
                ->map(fn (Order $order) => $this->formatRecentOrder($order, $seller))
                ->values(),
            'low_stock_alerts' => $lowStockProducts
                ->sortBy('stock')
                ->take(6)
                ->map(fn ($product) => [
                    'id' => (string) ($product->id ?? ''),
                    'name' => $product->name,
                    'stock' => (int) ($product->stock ?? 0),
                    'status' => $product->status,
                    'image' => $product->image,
                ])
                ->values(),
            'insights' => $this->buildInsights(
                $products->count(),
                $orders->count(),
                $lowStockProducts->count(),
                $deliveredOrders->count(),
                $pendingOrProcessingOrders->count()
            ),
        ];
    }

    private function formatRecentOrder(Order $order, User $seller): array
    {
        $sellerItems = $order->items
            ->where('seller_id', $seller->id)
            ->values();

        return [
            'id' => $order->id,
            'buyer_name' => $order->buyer?->name,
            'status' => $order->status,
            'seller_total' => (float) $sellerItems->sum('subtotal'),
            'item_count' => $sellerItems->sum('quantity'),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }

    private function sumSellerOrderTotals($orders, User $seller): float
    {
        return (float) $orders->sum(function (Order $order) use ($seller) {
            return $order->items
                ->where('seller_id', $seller->id)
                ->sum('subtotal');
        });
    }

    private function buildInsights(
        int $totalProducts,
        int $totalOrders,
        int $lowStockCount,
        int $deliveredCount,
        int $pendingProcessingCount
    ): array {
        $insights = [];

        $insights[] = $lowStockCount > 0
            ? sprintf('%d product%s need stock attention soon.', $lowStockCount, $lowStockCount === 1 ? '' : 's')
            : 'Inventory looks healthy with no immediate low-stock alerts.';

        $insights[] = $pendingProcessingCount > 0
            ? sprintf('%d order%s still need follow-up in your workflow.', $pendingProcessingCount, $pendingProcessingCount === 1 ? '' : 's')
            : 'No pending or processing orders are waiting on you right now.';

        $insights[] = $deliveredCount > 0
            ? sprintf('%d delivered order%s have already contributed to your earnings.', $deliveredCount, $deliveredCount === 1 ? '' : 's')
            : 'Delivered orders will appear here as soon as your first shipment is completed.';

        $insights[] = $totalOrders > 0
            ? sprintf('Your catalog of %d product%s has generated %d order%s so far.', $totalProducts, $totalProducts === 1 ? '' : 's', $totalOrders, $totalOrders === 1 ? '' : 's')
            : 'Once orders arrive, this workspace will surface fulfillment and stock signals here.';

        return $insights;
    }
}
