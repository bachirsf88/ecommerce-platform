<?php

namespace App\Http\Controllers\API\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateAccountPasswordRequest;
use App\Http\Requests\Account\UpdateAccountProfileRequest;
use App\Services\Account\AccountService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AccountService $accountService
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(
            'Account fetched successfully.',
            $this->accountService->getAccount($request->user())
        );
    }

    public function updateProfile(UpdateAccountProfileRequest $request): JsonResponse
    {
        return $this->successResponse(
            'Account updated successfully.',
            $this->accountService->updateProfile(
                $request->user(),
                $request->validated(),
                $request->file('profile_image')
            )
        );
    }

    public function updatePassword(UpdateAccountPasswordRequest $request): JsonResponse
    {
        $result = $this->accountService->updatePassword(
            $request->user(),
            $request->validated()
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], null, $result['status_code']);
        }

        return $this->successResponse($result['message'], null, $result['status_code']);
    }
}
