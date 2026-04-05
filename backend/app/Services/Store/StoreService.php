<?php

namespace App\Services\Store;

use App\Models\Store;
use App\Models\User;
use App\Services\Concerns\HandlesPublicFiles;
use Illuminate\Http\UploadedFile;

class StoreService
{
    use HandlesPublicFiles;

    public function getPublicStoreById(int|string $id): ?array
    {
        $store = Store::with('seller')->find($this->normalizeIdentifier($id));

        if (! $store || ! $store->seller || ! $store->seller->isSeller()) {
            return null;
        }

        return $this->transformPublicStore($store);
    }

    public function getPublicStoreBySellerId(int|string $sellerId): ?array
    {
        $seller = User::with('store')
            ->find($this->normalizeIdentifier($sellerId));

        if (! $seller || ! $seller->isSeller() || ! $seller->store) {
            return null;
        }

        return $this->transformPublicStore($seller->store->loadMissing('seller'));
    }

    public function getSellerStore(User $seller): ?array
    {
        $store = $seller->store()->first();

        if (! $store) {
            return null;
        }

        return $this->transformSellerStore($store->loadMissing('seller'));
    }

    public function updateSellerStore(
        User $seller,
        array $data,
        ?UploadedFile $logo = null,
        ?UploadedFile $banner = null
    ): array {
        unset(
            $data['logo'],
            $data['banner'],
            $data['logo_path'],
            $data['banner_path'],
            $data['logo_url'],
            $data['banner_url'],
            $data['logo_image_url'],
            $data['banner_image_url']
        );

        $store = $seller->store()->firstOrCreate(
            ['seller_id' => $seller->id],
            [
                'store_name' => $seller->name . '\'s Store',
                'store_address' => '',
                'postal_code' => '',
                'contact_email' => $seller->email,
            ]
        );

        $previousLogoPath = $store->logo_path;
        $previousBannerPath = $store->banner_path;
        $nextLogoPath = $previousLogoPath;
        $nextBannerPath = $previousBannerPath;

        if ($logo) {
            $nextLogoPath = $this->storePublicFile($logo, 'stores/logos');
            $data['logo_path'] = $nextLogoPath;
        }

        if ($banner) {
            $nextBannerPath = $this->storePublicFile($banner, 'stores/banners');
            $data['banner_path'] = $nextBannerPath;
        }

        $data['contact_email'] = $data['contact_email'] ?? $seller->email;

        $store->update($data);

        if ($logo && $previousLogoPath !== $nextLogoPath) {
            $this->deletePublicFile($previousLogoPath);
        }

        if ($banner && $previousBannerPath !== $nextBannerPath) {
            $this->deletePublicFile($previousBannerPath);
        }

        return $this->transformSellerStore($store->fresh()->loadMissing('seller'));
    }

    private function transformPublicStore(Store $store): array
    {
        /** @var User|null $seller */
        $seller = $store->seller;

        return [
            'id' => $store->id,
            'store_name' => $store->store_name,
            'store_address' => $store->store_address,
            'postal_code' => $store->postal_code,
            'description' => $store->description,
            'contact_email' => $store->contact_email,
            'phone_number' => $store->phone_number,
            'logo_image_url' => $store->logo_image_url,
            'banner_image_url' => $store->banner_image_url,
            'logo_url' => $store->logo_url,
            'banner_url' => $store->banner_url,
            'seller' => [
                'id' => $seller?->id,
                'name' => $seller?->name,
                'status' => $seller?->seller_status,
                'bio' => $seller?->bio,
                'profile_image_url' => $seller?->profile_image_url,
            ],
        ];
    }

    private function transformSellerStore(Store $store): array
    {
        return [
            ...$this->transformPublicStore($store),
            'logo_path' => $store->logo_path,
            'banner_path' => $store->banner_path,
            'created_at' => $store->created_at,
            'updated_at' => $store->updated_at,
        ];
    }

    private function normalizeIdentifier(int|string $value): int|string
    {
        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed !== '' && ctype_digit($trimmed)) {
                return (int) $trimmed;
            }

            return $trimmed;
        }

        return $value;
    }
}
