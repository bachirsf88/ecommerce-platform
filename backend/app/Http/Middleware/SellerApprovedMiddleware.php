<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerApprovedMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'errors' => null,
            ], 401);
        }

        if ($user->role !== User::ROLE_SELLER) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource.',
                'errors' => null,
            ], 403);
        }

        if ($user->seller_status === User::SELLER_STATUS_APPROVED) {
            return $next($request);
        }

        $message = match ($user->seller_status) {
            User::SELLER_STATUS_REJECTED => 'Your seller account was rejected. Please contact support or an administrator.',
            User::SELLER_STATUS_PENDING, null => 'Your seller account is pending admin approval.',
            default => 'Your seller account is not approved to access this resource.',
        };

        return response()->json([
            'success' => false,
            'message' => $message,
            'seller_status' => $user->seller_status,
            'errors' => null,
        ], 403);
    }
}
