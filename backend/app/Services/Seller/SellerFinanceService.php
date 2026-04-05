<?php

namespace App\Services\Seller;

use App\Models\Order;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Repositories\Interfaces\OrderRepositoryInterface;

class SellerFinanceService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {
    }

    public function getOverview(User $seller): array
    {
        $orders = $this->orderRepository->getOrdersBySellerId($seller->id);
        $deliveredOrders = $orders
            ->where('status', Order::STATUS_DELIVERED)
            ->values();

        $withdrawals = WithdrawalRequest::query()
            ->where('seller_id', $seller->id)
            ->latest()
            ->get();

        $lifetimeEarnings = $this->sumSellerOrderTotals($deliveredOrders, $seller);
        $approvedWithdrawals = (float) $withdrawals
            ->where('status', WithdrawalRequest::STATUS_APPROVED)
            ->sum('amount');
        $pendingWithdrawals = (float) $withdrawals
            ->where('status', WithdrawalRequest::STATUS_PENDING)
            ->sum('amount');
        $availableBalance = max(0, $lifetimeEarnings - $approvedWithdrawals - $pendingWithdrawals);

        return [
            'summary' => [
                'available_balance' => $availableBalance,
                'lifetime_earnings' => $lifetimeEarnings,
                'approved_withdrawals' => $approvedWithdrawals,
                'pending_withdrawals' => $pendingWithdrawals,
            ],
            'monthly_overview' => $this->buildMonthlyOverview($deliveredOrders, $seller),
            'recent_transactions' => $this->buildRecentTransactions($deliveredOrders, $withdrawals, $seller),
            'withdrawal_requests' => $withdrawals->take(8)->values(),
        ];
    }

    public function createWithdrawalRequest(User $seller, array $data): array
    {
        $overview = $this->getOverview($seller);
        $availableBalance = (float) ($overview['summary']['available_balance'] ?? 0);
        $amount = (float) $data['amount'];

        if ($amount > $availableBalance) {
            return [
                'success' => false,
                'message' => 'Withdrawal amount exceeds available balance.',
                'status_code' => 422,
            ];
        }

        $withdrawal = WithdrawalRequest::create([
            'seller_id' => $seller->id,
            'amount' => $amount,
            'payout_method' => $data['payout_method'],
            'destination_account' => $data['destination_account'],
            'notes' => $data['notes'] ?? null,
            'status' => WithdrawalRequest::STATUS_PENDING,
        ]);

        return [
            'success' => true,
            'message' => 'Withdrawal request submitted successfully.',
            'status_code' => 201,
            'data' => $withdrawal,
        ];
    }

    private function buildMonthlyOverview($orders, User $seller): array
    {
        $months = collect(range(0, 5))
            ->map(function (int $offset) {
                $date = now()->startOfMonth()->subMonths(5 - $offset);

                return [
                    'key' => $date->format('Y-m'),
                    'label' => $date->format('M Y'),
                    'amount' => 0,
                ];
            })
            ->keyBy('key');

        foreach ($orders as $order) {
            $key = optional($order->updated_at)->format('Y-m');

            if (! $key || ! $months->has($key)) {
                continue;
            }

            $entry = $months->get($key);
            $entry['amount'] += (float) $order->items
                ->where('seller_id', $seller->id)
                ->sum('subtotal');

            $months->put($key, $entry);
        }

        return $months->values()->all();
    }

    private function buildRecentTransactions($orders, $withdrawals, User $seller): array
    {
        $orderTransactions = $orders->map(function (Order $order) use ($seller) {
            return [
                'id' => 'order-' . $order->id,
                'type' => 'order',
                'title' => 'Order #' . $order->id . ' delivered',
                'amount' => (float) $order->items
                    ->where('seller_id', $seller->id)
                    ->sum('subtotal'),
                'direction' => 'credit',
                'status' => 'completed',
                'date' => $order->updated_at,
            ];
        });

        $withdrawalTransactions = $withdrawals->map(function (WithdrawalRequest $withdrawal) {
            return [
                'id' => 'withdrawal-' . $withdrawal->id,
                'type' => 'withdrawal',
                'title' => 'Withdrawal request via ' . $withdrawal->payout_method,
                'amount' => (float) $withdrawal->amount,
                'direction' => 'debit',
                'status' => $withdrawal->status,
                'date' => $withdrawal->created_at,
            ];
        });

        return $orderTransactions
            ->concat($withdrawalTransactions)
            ->sortByDesc('date')
            ->take(10)
            ->values()
            ->all();
    }

    private function sumSellerOrderTotals($orders, User $seller): float
    {
        return (float) $orders->sum(function (Order $order) use ($seller) {
            return $order->items
                ->where('seller_id', $seller->id)
                ->sum('subtotal');
        });
    }
}
