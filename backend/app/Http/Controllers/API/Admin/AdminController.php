<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mongo\ProductDocument;
use App\Models\Order;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Services\Admin\AdminService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AdminService $adminService
    ) {
    }

    public function dashboard(): JsonResponse
    {
        return $this->successResponse(
            'Admin dashboard fetched successfully.',
            $this->adminService->getDashboard()
        );
    }

    public function users(Request $request): JsonResponse
    {
        $users = $this->adminService->getUsers($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', Rule::in([
                User::ROLE_BUYER,
                User::ROLE_SELLER,
                User::ROLE_ADMIN,
            ])],
        ]));

        return $this->successResponse('Users fetched successfully.', $users);
    }

    public function sellers(Request $request): JsonResponse
    {
        $sellers = $this->adminService->getSellers($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in([
                User::SELLER_STATUS_PENDING,
                User::SELLER_STATUS_APPROVED,
                User::SELLER_STATUS_REJECTED,
            ])],
        ]));

        return $this->successResponse('Sellers fetched successfully.', $sellers);
    }

    public function approveSeller(string $id): JsonResponse
    {
        $seller = $this->adminService->approveSeller($id);

        if (! $seller) {
            return $this->errorResponse('Seller not found.', null, 404);
        }

        return $this->successResponse('Seller approved successfully.', $seller);
    }

    public function rejectSeller(string $id): JsonResponse
    {
        $seller = $this->adminService->rejectSeller($id);

        if (! $seller) {
            return $this->errorResponse('Seller not found.', null, 404);
        }

        return $this->successResponse('Seller rejected successfully.', $seller);
    }

    public function products(Request $request): JsonResponse
    {
        $products = $this->adminService->getProducts($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in([
                ProductDocument::STATUS_ACTIVE,
                ProductDocument::STATUS_INACTIVE,
            ])],
            'category' => ['nullable', 'string', 'max:255'],
            'seller_id' => ['nullable', 'string', 'max:255'],
        ]));

        return $this->successResponse('Products fetched successfully.', $products);
    }

    public function updateProductStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                ProductDocument::STATUS_ACTIVE,
                ProductDocument::STATUS_INACTIVE,
            ])],
        ]);

        $product = $this->adminService->updateProductStatus($id, $validated['status']);

        if (! $product) {
            return $this->errorResponse('Product not found.', null, 404);
        }

        return $this->successResponse('Product status updated successfully.', $product);
    }

    public function orders(Request $request): JsonResponse
    {
        $orders = $this->adminService->getOrders($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(Order::STATUSES)],
            'buyer_id' => ['nullable', 'integer', 'min:1'],
            'seller_id' => ['nullable', 'integer', 'min:1'],
        ]));

        return $this->successResponse('Orders fetched successfully.', $orders);
    }

    public function reviews(Request $request): JsonResponse
    {
        $reviews = $this->adminService->getReviews($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'product_id' => ['nullable', 'string', 'max:255'],
        ]));

        return $this->successResponse('Reviews fetched successfully.', $reviews);
    }

    public function destroyReview(string $id): JsonResponse
    {
        if (! $this->adminService->deleteReview($id)) {
            return $this->errorResponse('Review not found.', null, 404);
        }

        return $this->successResponse('Review deleted successfully.');
    }

    public function withdrawals(Request $request): JsonResponse
    {
        $withdrawals = $this->adminService->getWithdrawals($request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(WithdrawalRequest::STATUSES)],
        ]));

        return $this->successResponse('Withdrawal requests fetched successfully.', $withdrawals);
    }

    public function approveWithdrawal(string $id): JsonResponse
    {
        $withdrawal = $this->adminService->approveWithdrawal($id);

        if (! $withdrawal) {
            return $this->errorResponse('Withdrawal request not found.', null, 404);
        }

        return $this->successResponse('Withdrawal request approved successfully.', $withdrawal);
    }

    public function rejectWithdrawal(string $id): JsonResponse
    {
        $withdrawal = $this->adminService->rejectWithdrawal($id);

        if (! $withdrawal) {
            return $this->errorResponse('Withdrawal request not found.', null, 404);
        }

        return $this->successResponse('Withdrawal request rejected successfully.', $withdrawal);
    }
}
