<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $name = env('ADMIN_NAME', 'Admin');

        if (! $email || ! $password) {
            $this->command?->warn('ADMIN_EMAIL or ADMIN_PASSWORD is missing. Admin user was not created.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => User::ROLE_ADMIN,
                'seller_status' => null,
            ]
        );

        $this->command?->info("Admin user is ready: {$email}");
    }
}
