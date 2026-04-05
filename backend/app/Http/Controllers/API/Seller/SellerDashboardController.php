<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Services\Seller\SellerDashboardService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerDashboardController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly SellerDashboardService $sellerDashboardService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(
            'Seller dashboard fetched successfully.',
            $this->sellerDashboardService->getDashboard($request->user())
        );
    }
}
