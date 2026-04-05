<?php

namespace App\Services\Account;

use App\Models\User;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

class AccountService
{
    use HandlesPublicFiles;

    public function getAccount(User $user): array
    {
        return $this->transformUser($user->fresh()->loadMissing('store'));
    }

    public function updateProfile(User $user, array $data, ?UploadedFile $profileImage = null): array
    {
        unset($data['profile_image']);

        $previousProfileImagePath = $user->profile_image_path;

        if ($profileImage) {
            $data['profile_image_path'] = $this->storePublicFile($profileImage, 'profiles');
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone_number' => $data['phone_number'] ?? null,
            'profile_image_path' => $data['profile_image_path'] ?? $user->profile_image_path,
        ]);

        if ($profileImage) {
            $this->deletePublicFile($previousProfileImagePath);
        }

        return $this->transformUser($user->fresh()->loadMissing('store'));
    }

    public function updatePassword(User $user, array $data): array
    {
        if (! Hash::check($data['current_password'], $user->password)) {
            return [
                'success' => false,
                'message' => 'Current password is incorrect.',
                'status_code' => 422,
            ];
        }

        $user->update([
            'password' => $data['password'],
        ]);

        return [
            'success' => true,
            'message' => 'Password updated successfully.',
            'status_code' => 200,
        ];
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            'seller_status' => $user->seller_status,
            'profile_image_url' => $user->profile_image_url,
            'store' => $user->store,
        ];
    }
}
