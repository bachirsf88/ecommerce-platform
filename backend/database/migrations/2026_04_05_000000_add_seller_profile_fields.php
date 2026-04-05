<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('seller_status');
            $table->string('profile_image_path')->nullable()->after('bio');
            $table->json('notification_preferences')->nullable()->after('profile_image_path');
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->string('contact_email')->nullable()->after('description');
            $table->string('phone_number')->nullable()->after('contact_email');
            $table->string('logo_path')->nullable()->after('phone_number');
            $table->string('banner_path')->nullable()->after('logo_path');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'contact_email',
                'phone_number',
                'logo_path',
                'banner_path',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'profile_image_path',
                'notification_preferences',
            ]);
        });
    }
};
