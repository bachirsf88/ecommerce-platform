<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AdminService $adminService
    ) {
    }

    public function users(): JsonResponse
    {
        $users = $this->adminService->getUsers();

        return $this->successResponse('Users fetched successfully.', $users);
    }

    public function sellers(): JsonResponse
    {
        $sellers = $this->adminService->getSellers();

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

    public function products(): JsonResponse
    {
        $products = $this->adminService->getProducts();

        return $this->successResponse('Products fetched successfully.', $products);
    }

    public function orders(): JsonResponse
    {
        $orders = $this->adminService->getOrders();

        return $this->successResponse('Orders fetched successfully.', $orders);
    }
}
