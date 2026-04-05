<?php

namespace App\Services\Seller;

use App\Models\User;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

class SellerSettingsService
{
    use HandlesPublicFiles;

    public function getSettings(User $seller): array
    {
        return $this->transformSeller($seller->fresh()->loadMissing('store'));
    }

    public function updateProfile(User $seller, array $data, ?UploadedFile $profileImage = null): array
    {
        unset($data['profile_image']);

        $previousProfileImagePath = $seller->profile_image_path;

        if ($profileImage) {
            $data['profile_image_path'] = $this->storePublicFile($profileImage, 'profiles');
        }

        $seller->update([
            'name' => $data['name'],
            'bio' => $data['bio'] ?? null,
            'notification_preferences' => $data['notification_preferences'] ?? $seller->notification_preferences,
            'profile_image_path' => $data['profile_image_path'] ?? $seller->profile_image_path,
        ]);

        if ($profileImage) {
            $this->deletePublicFile($previousProfileImagePath);
        }

        return $this->transformSeller($seller->fresh()->loadMissing('store'));
    }

    public function updatePassword(User $seller, array $data): array
    {
        if (! Hash::check($data['current_password'], $seller->password)) {
            return [
                'success' => false,
                'message' => 'Current password is incorrect.',
                'status_code' => 422,
            ];
        }

        $seller->update([
            'password' => $data['password'],
        ]);

        return [
            'success' => true,
            'message' => 'Password updated successfully.',
            'status_code' => 200,
        ];
    }

    private function transformSeller(User $seller): array
    {
        return [
            'id' => $seller->id,
            'name' => $seller->name,
            'email' => $seller->email,
            'role' => $seller->role,
            'seller_status' => $seller->seller_status,
            'bio' => $seller->bio,
            'profile_image_url' => $seller->profile_image_url,
            'notification_preferences' => $seller->notification_preferences ?? [
                'order_updates' => true,
                'review_updates' => true,
                'marketing_updates' => false,
            ],
            'store' => $seller->store,
        ];
    }
}
