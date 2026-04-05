<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UpdateSellerPasswordRequest;
use App\Http\Requests\Seller\UpdateSellerProfileRequest;
use App\Services\Seller\SellerSettingsService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerSettingsController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly SellerSettingsService $sellerSettingsService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(
            'Seller settings fetched successfully.',
            $this->sellerSettingsService->getSettings($request->user())
        );
    }

    public function updateProfile(UpdateSellerProfileRequest $request): JsonResponse
    {
        return $this->successResponse(
            'Seller profile updated successfully.',
            $this->sellerSettingsService->updateProfile(
                $request->user(),
                $request->validated(),
                $request->file('profile_image')
            )
        );
    }

    public function updatePassword(UpdateSellerPasswordRequest $request): JsonResponse
    {
        $result = $this->sellerSettingsService->updatePassword(
            $request->user(),
            $request->validated()
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse($result['message'], null, $result['status_code']);
    }
}
