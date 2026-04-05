<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\StoreWithdrawalRequest;
use App\Services\Seller\SellerFinanceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerFinanceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly SellerFinanceService $sellerFinanceService
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        return $this->successResponse(
            'Seller finance overview fetched successfully.',
            $this->sellerFinanceService->getOverview($request->user())
        );
    }

    public function storeWithdrawal(StoreWithdrawalRequest $request): JsonResponse
    {
        $result = $this->sellerFinanceService->createWithdrawalRequest(
            $request->user(),
            $request->validated()
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse(
            $result['message'],
            $result['data'],
            $result['status_code']
        );
    }
}
