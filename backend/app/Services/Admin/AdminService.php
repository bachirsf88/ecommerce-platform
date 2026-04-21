<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Models\Mongo\ProductDocument;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AdminService
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    public function getDashboard(): array
    {
        $totalUsers = User::count();
        $totalBuyers = User::where('role', User::ROLE_BUYER)->count();
        $totalSellers = User::where('role', User::ROLE_SELLER)->count();
        $pendingSellers = User::where('role', User::ROLE_SELLER)
            ->where('seller_status', User::SELLER_STATUS_PENDING)
            ->count();
        $approvedSellers = User::where('role', User::ROLE_SELLER)
            ->where('seller_status', User::SELLER_STATUS_APPROVED)
            ->count();

        $totalProducts = ProductDocument::query()->count();
        $totalOrders = Order::count();
        $deliveredOrders = Order::where('status', Order::STATUS_DELIVERED)->count();
        $pendingOrders = Order::where('status', Order::STATUS_PENDING)->count();
        $cancelledOrders = Order::where('status', Order::STATUS_CANCELLED)->count();
        $totalReviews = Review::count();
        $pendingWithdrawals = WithdrawalRequest::where('status', WithdrawalRequest::STATUS_PENDING)->count();

        $recentSellerRegistrations = User::with('store')
            ->where('role', User::ROLE_SELLER)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (User $seller) => $this->formatSeller($seller))
            ->values()
            ->all();

        $recentOrders = Order::with(['buyer', 'items.seller'])
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order))
            ->values()
            ->all();

        $recentWithdrawalRequests = WithdrawalRequest::with('seller.store')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (WithdrawalRequest $withdrawal) => $this->formatWithdrawal($withdrawal))
            ->values()
            ->all();

        return [
            'metrics' => [
                'total_users' => $totalUsers,
                'total_buyers' => $totalBuyers,
                'total_sellers' => $totalSellers,
                'pending_sellers' => $pendingSellers,
                'approved_sellers' => $approvedSellers,
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'delivered_orders' => $deliveredOrders,
                'pending_orders' => $pendingOrders,
                'cancelled_orders' => $cancelledOrders,
                'total_reviews' => $totalReviews,
                'pending_withdrawal_requests' => $pendingWithdrawals,
            ],
            'recent_seller_registrations' => $recentSellerRegistrations,
            'recent_orders' => $recentOrders,
            'recent_withdrawal_requests' => $recentWithdrawalRequests,
        ];
    }

    public function getUsers(array $filters = []): Collection
    {
        return User::with('store')
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $this->applyUserSearch($query, $search);
            })
            ->when($filters['role'] ?? null, function (Builder $query, string $role) {
                $query->where('role', $role);
            })
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->formatUser($user))
            ->values();
    }

    public function getSellers(array $filters = []): Collection
    {
        return User::with('store')
            ->where('role', User::ROLE_SELLER)
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $nestedQuery) use ($search) {
                    $this->applyUserSearch($nestedQuery, $search);
                    $nestedQuery->orWhereHas('store', function (Builder $storeQuery) use ($search) {
                        $storeQuery->where('store_name', 'like', '%' . $search . '%')
                            ->orWhere('contact_email', 'like', '%' . $search . '%')
                            ->orWhere('phone_number', 'like', '%' . $search . '%');
                    });
                });
            })
            ->when($filters['status'] ?? null, function (Builder $query, string $status) {
                $query->where('seller_status', $status);
            })
            ->latest()
            ->get()
            ->map(fn (User $seller) => $this->formatSeller($seller))
            ->values();
    }

    public function approveSeller(int|string $id): ?array
    {
        return $this->updateSellerStatus($id, User::SELLER_STATUS_APPROVED);
    }

    public function rejectSeller(int|string $id): ?array
    {
        return $this->updateSellerStatus($id, User::SELLER_STATUS_REJECTED);
    }

    public function getProducts(array $filters = []): Collection
    {
        $products = ProductDocument::query()
            ->when($filters['status'] ?? null, function ($query, string $status) {
                $query->where('status', $status);
            })
            ->when($filters['category'] ?? null, function ($query, string $category) {
                $query->where('category', $category);
            })
            ->when($filters['seller_id'] ?? null, function ($query, string $sellerId) {
                $query->where('seller_id', (string) $sellerId);
            })
            ->latest()
            ->get();

        $formattedProducts = $this->formatProducts($products);

        if (! ($filters['search'] ?? null)) {
            return $formattedProducts;
        }

        $search = mb_strtolower(trim((string) $filters['search']));

        return $formattedProducts
            ->filter(function (array $product) use ($search) {
                $haystacks = [
                    $product['name'] ?? null,
                    $product['description'] ?? null,
                    $product['category'] ?? null,
                    $product['seller']['name'] ?? null,
                    $product['seller']['email'] ?? null,
                    $product['seller']['store_name'] ?? null,
                ];

                foreach ($haystacks as $haystack) {
                    if ($haystack !== null && str_contains(mb_strtolower((string) $haystack), $search)) {
                        return true;
                    }
                }

                return false;
            })
            ->values();
    }

    public function updateProductStatus(int|string $id, string $status): ?array
    {
        $product = $this->productRepository->findById($id);

        if (! $product) {
            return null;
        }

        $updatedProduct = $this->productRepository->update($product, [
            'status' => $status,
        ]);

        return $this->formatProducts(collect([$updatedProduct]))->first();
    }

    public function getOrders(array $filters = []): Collection
    {
        $orders = Order::with(['buyer', 'items.seller'])
            ->when($filters['status'] ?? null, function (Builder $query, string $status) {
                $query->where('status', $status);
            })
            ->when($filters['buyer_id'] ?? null, function (Builder $query, string $buyerId) {
                $query->where('buyer_id', $buyerId);
            })
            ->when($filters['seller_id'] ?? null, function (Builder $query, string $sellerId) {
                $query->whereHas('items', function (Builder $itemQuery) use ($sellerId) {
                    $itemQuery->where('seller_id', $sellerId);
                });
            })
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order))
            ->values();

        if (! ($filters['search'] ?? null)) {
            return $orders;
        }

        $search = mb_strtolower(trim((string) $filters['search']));

        return $orders
            ->filter(function (array $order) use ($search) {
                $haystacks = [
                    (string) ($order['id'] ?? ''),
                    $order['buyer']['name'] ?? null,
                    $order['buyer']['email'] ?? null,
                    $order['full_name'] ?? null,
                    $order['status'] ?? null,
                ];

                foreach ($order['seller_names'] ?? [] as $sellerName) {
                    $haystacks[] = $sellerName;
                }

                foreach ($haystacks as $haystack) {
                    if ($haystack !== null && str_contains(mb_strtolower((string) $haystack), $search)) {
                        return true;
                    }
                }

                return false;
            })
            ->values();
    }

    public function getReviews(array $filters = []): Collection
    {
        $reviews = Review::with(['buyer', 'order'])
            ->when($filters['rating'] ?? null, function (Builder $query, int|string $rating) {
                $query->where('rating', (int) $rating);
            })
            ->when($filters['product_id'] ?? null, function (Builder $query, string $productId) {
                $query->where('product_id', $productId);
            })
            ->latest()
            ->get()
            ->map(fn (Review $review) => $this->formatReview($review))
            ->values();

        if (! ($filters['search'] ?? null)) {
            return $reviews;
        }

        $search = mb_strtolower(trim((string) $filters['search']));

        return $reviews
            ->filter(function (array $review) use ($search) {
                $haystacks = [
                    $review['comment'] ?? null,
                    $review['buyer']['name'] ?? null,
                    $review['buyer']['email'] ?? null,
                    $review['product']['name'] ?? null,
                    (string) ($review['order']['id'] ?? ''),
                ];

                foreach ($haystacks as $haystack) {
                    if ($haystack !== null && str_contains(mb_strtolower((string) $haystack), $search)) {
                        return true;
                    }
                }

                return false;
            })
            ->values();
    }

    public function deleteReview(int|string $id): bool
    {
        $review = Review::find($id);

        if (! $review) {
            return false;
        }

        return (bool) $review->delete();
    }

    public function getWithdrawals(array $filters = []): Collection
    {
        return WithdrawalRequest::with('seller.store')
            ->when($filters['status'] ?? null, function (Builder $query, string $status) {
                $query->where('status', $status);
            })
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $nestedQuery) use ($search) {
                    $nestedQuery->where('payout_method', 'like', '%' . $search . '%')
                        ->orWhere('destination_account', 'like', '%' . $search . '%')
                        ->orWhereHas('seller', function (Builder $sellerQuery) use ($search) {
                            $sellerQuery->where('name', 'like', '%' . $search . '%')
                                ->orWhere('email', 'like', '%' . $search . '%');
                        });
                });
            })
            ->latest()
            ->get()
            ->map(fn (WithdrawalRequest $withdrawal) => $this->formatWithdrawal($withdrawal))
            ->values();
    }

    public function approveWithdrawal(int|string $id): ?array
    {
        return $this->updateWithdrawalStatus($id, WithdrawalRequest::STATUS_APPROVED);
    }

    public function rejectWithdrawal(int|string $id): ?array
    {
        return $this->updateWithdrawalStatus($id, WithdrawalRequest::STATUS_REJECTED);
    }

    private function updateSellerStatus(int|string $id, string $status): ?array
    {
        $seller = User::with('store')
            ->where('role', User::ROLE_SELLER)
            ->find($id);

        if (! $seller) {
            return null;
        }

        $seller->update([
            'seller_status' => $status,
        ]);

        return $this->formatSeller($seller->fresh()->load('store'));
    }

    private function updateWithdrawalStatus(int|string $id, string $status): ?array
    {
        $withdrawal = WithdrawalRequest::with('seller.store')->find($id);

        if (! $withdrawal) {
            return null;
        }

        $withdrawal->update([
            'status' => $status,
        ]);

        return $this->formatWithdrawal($withdrawal->fresh()->load('seller.store'));
    }

    private function formatProducts(Collection $products): Collection
    {
        $sellerIds = $products
            ->pluck('seller_id')
            ->filter()
            ->map(fn ($sellerId) => (int) $sellerId)
            ->unique()
            ->values();

        $sellers = User::with('store')
            ->whereIn('id', $sellerIds)
            ->get()
            ->keyBy('id');

        return $products
            ->map(function ($product) use ($sellers) {
                /** @var User|null $seller */
                $seller = $sellers->get((int) $product->seller_id);

                return [
                    'id' => (string) ($product->id ?? ''),
                    'seller_id' => (string) ($product->seller_id ?? ''),
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float) ($product->price ?? 0),
                    'stock' => (int) ($product->stock ?? 0),
                    'category' => $product->category,
                    'image' => $product->image,
                    'image_url' => $product->image_url,
                    'status' => $product->status,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'seller' => $seller ? [
                        'id' => $seller->id,
                        'name' => $seller->name,
                        'email' => $seller->email,
                        'seller_status' => $seller->seller_status,
                        'store_name' => $seller->store?->store_name,
                    ] : null,
                ];
            })
            ->values();
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            'seller_status' => $user->seller_status,
            'created_at' => $user->created_at,
            'profile_image_url' => $user->profile_image_url,
            'store' => $user->store ? [
                'id' => $user->store->id,
                'store_name' => $user->store->store_name,
                'contact_email' => $user->store->contact_email,
                'phone_number' => $user->store->phone_number,
            ] : null,
        ];
    }

    private function formatSeller(User $seller): array
    {
        return [
            ...$this->formatUser($seller),
            'bio' => $seller->bio,
            'store' => $seller->store ? [
                'id' => $seller->store->id,
                'store_name' => $seller->store->store_name,
                'description' => $seller->store->description,
                'store_address' => $seller->store->store_address,
                'postal_code' => $seller->store->postal_code,
                'contact_email' => $seller->store->contact_email,
                'phone_number' => $seller->store->phone_number,
                'logo_url' => $seller->store->logo_url,
                'banner_url' => $seller->store->banner_url,
            ] : null,
        ];
    }

    private function formatOrder(Order $order): array
    {
        $items = $order->items
            ->map(function ($item) {
                $product = $this->productRepository->findById($item->product_id);

                return [
                    'id' => $item->id,
                    'product_id' => (string) $item->product_id,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                    'seller' => [
                        'id' => $item->seller?->id,
                        'name' => $item->seller?->name,
                        'email' => $item->seller?->email,
                    ],
                    'product' => $product ? [
                        'id' => (string) ($product->id ?? ''),
                        'name' => $product->name,
                        'image_url' => $product->image_url,
                        'status' => $product->status,
                    ] : null,
                ];
            })
            ->values();

        return [
            'id' => $order->id,
            'buyer_id' => $order->buyer_id,
            'buyer' => [
                'id' => $order->buyer?->id,
                'name' => $order->buyer?->name,
                'email' => $order->buyer?->email,
            ],
            'full_name' => $order->full_name,
            'phone' => $order->phone,
            'country' => $order->country,
            'state' => $order->state,
            'municipality' => $order->municipality,
            'neighborhood' => $order->neighborhood,
            'street_address' => $order->street_address,
            'shipping_method' => $order->shipping_method,
            'payment_method' => $order->payment_method,
            'shipping_address' => $order->shipping_address,
            'total' => (float) $order->total,
            'shipping_cost' => (float) $order->shipping_cost,
            'status' => $order->status,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'item_count' => (int) $items->sum('quantity'),
            'seller_names' => $items
                ->pluck('seller.name')
                ->filter()
                ->unique()
                ->values()
                ->all(),
            'items' => $items->all(),
        ];
    }

    private function formatReview(Review $review): array
    {
        $product = $this->productRepository->findById($review->product_id);

        return [
            'id' => $review->id,
            'buyer_id' => $review->buyer_id,
            'order_id' => $review->order_id,
            'product_id' => (string) $review->product_id,
            'rating' => (int) $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
            'buyer' => [
                'id' => $review->buyer?->id,
                'name' => $review->buyer?->name,
                'email' => $review->buyer?->email,
            ],
            'order' => [
                'id' => $review->order?->id,
                'status' => $review->order?->status,
                'total' => $review->order ? (float) $review->order->total : null,
            ],
            'product' => $product ? [
                'id' => (string) ($product->id ?? ''),
                'name' => $product->name,
                'image_url' => $product->image_url,
                'status' => $product->status,
                'seller_id' => (string) ($product->seller_id ?? ''),
            ] : null,
        ];
    }

    private function formatWithdrawal(WithdrawalRequest $withdrawal): array
    {
        return [
            'id' => $withdrawal->id,
            'seller_id' => $withdrawal->seller_id,
            'amount' => (float) $withdrawal->amount,
            'payout_method' => $withdrawal->payout_method,
            'destination_account' => $withdrawal->destination_account,
            'status' => $withdrawal->status,
            'notes' => $withdrawal->notes,
            'created_at' => $withdrawal->created_at,
            'updated_at' => $withdrawal->updated_at,
            'seller' => [
                'id' => $withdrawal->seller?->id,
                'name' => $withdrawal->seller?->name,
                'email' => $withdrawal->seller?->email,
                'seller_status' => $withdrawal->seller?->seller_status,
                'store_name' => $withdrawal->seller?->store?->store_name,
            ],
        ];
    }

    private function applyUserSearch(Builder $query, string $search): void
    {
        $query->where(function (Builder $nestedQuery) use ($search) {
            $nestedQuery->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%');
        });
    }
}
