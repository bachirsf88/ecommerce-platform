<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class AdminService
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getUsers(): EloquentCollection
    {
        return User::orderBy('id')->get();
    }

    public function getSellers(): EloquentCollection
    {
        return User::where('role', User::ROLE_SELLER)
            ->orderBy('id')
            ->get();
    }

    public function approveSeller(int|string $id): ?User
    {
        $seller = User::where('role', User::ROLE_SELLER)->find($id);

        if (! $seller) {
            return null;
        }

        $seller->update([
            'seller_status' => User::SELLER_STATUS_APPROVED,
        ]);

        return $seller->fresh();
    }

    public function getProducts(): Collection
    {
        $products = $this->productRepository->getAll();
        $sellerIds = $products
            ->pluck('seller_id')
            ->filter()
            ->map(fn ($sellerId) => (int) $sellerId)
            ->unique()
            ->values();

        $sellers = User::whereIn('id', $sellerIds)->get()->keyBy('id');

        return $products->map(function ($product) use ($sellers) {
            $product->seller = $sellers->get((int) $product->seller_id);

            return $product;
        })->values();
    }

    public function getOrders(): Collection
    {
        return Order::with(['buyer', 'items.seller'])
            ->latest()
            ->get()
            ->map(function (Order $order) {
                $order->items->each(function ($item) {
                    $product = $this->productRepository->findById($item->product_id);
                    $item->setRelation('product', $product);
                });

                return $order;
            });
    }
}
