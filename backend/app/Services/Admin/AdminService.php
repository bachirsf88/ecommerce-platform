<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AdminService
{
    public function getUsers(): Collection
    {
        return User::orderBy('id')->get();
    }

    public function getSellers(): Collection
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
        return Product::with('seller')
            ->latest()
            ->get();
    }

    public function getOrders(): Collection
    {
        return Order::with(['buyer', 'items.product', 'items.seller'])
            ->latest()
            ->get();
    }
}
