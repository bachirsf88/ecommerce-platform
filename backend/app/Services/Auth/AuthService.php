<?php

namespace App\Services\Auth;

use App\Models\Store;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    public function register(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'seller_status' => $this->resolveSellerStatus($data['role']),
            ]);

            if ($data['role'] === User::ROLE_SELLER) {
                Store::create([
                    'seller_id' => $user->id,
                    'store_name' => $data['store_name'],
                    'store_address' => $data['store_address'],
                    'postal_code' => $data['postal_code'],
                    'description' => null,
                    'contact_email' => $data['email'],
                    'phone_number' => null,
                ]);
            }

            return $user->load('store');
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        $result = [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ];

        if ($user->role === User::ROLE_SELLER) {
            $result['store'] = $user->store;
        }

        return $result;
    }

    public function login(array $data): ?array
    {
        $user = $this->userRepository->findByEmail($data['email']);

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->loadMissing('store'),
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function me(User $user): User
    {
        return $user->loadMissing('store');
    }

    private function resolveSellerStatus(string $role): ?string
    {
        if ($role === User::ROLE_SELLER) {
            return User::SELLER_STATUS_PENDING;
        }

        return null;
    }
}
