<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('buyer_id');
            $table->string('phone')->nullable()->after('full_name');
            $table->string('country')->nullable()->after('phone');
            $table->string('state')->nullable()->after('country');
            $table->string('municipality')->nullable()->after('state');
            $table->string('neighborhood')->nullable()->after('municipality');
            $table->string('street_address')->nullable()->after('neighborhood');
            $table->text('notes')->nullable()->after('street_address');
            $table->string('shipping_method')->nullable()->after('notes');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('shipping_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'full_name',
                'phone',
                'country',
                'state',
                'municipality',
                'neighborhood',
                'street_address',
                'notes',
                'shipping_method',
                'shipping_cost',
            ]);
        });
    }
};
