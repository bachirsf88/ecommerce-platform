<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('order_items')) {
            return;
        }

        Schema::disableForeignKeyConstraints();

        Schema::create('order_items_mongodb_tmp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('product_id');
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        $orderItems = DB::table('order_items')
            ->select([
                'id',
                'order_id',
                'product_id',
                'seller_id',
                'quantity',
                'unit_price',
                'subtotal',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->get();

        foreach ($orderItems as $orderItem) {
            DB::table('order_items_mongodb_tmp')->insert([
                'id' => $orderItem->id,
                'order_id' => $orderItem->order_id,
                'product_id' => (string) $orderItem->product_id,
                'seller_id' => $orderItem->seller_id,
                'quantity' => $orderItem->quantity,
                'unit_price' => $orderItem->unit_price,
                'subtotal' => $orderItem->subtotal,
                'created_at' => $orderItem->created_at,
                'updated_at' => $orderItem->updated_at,
            ]);
        }

        Schema::drop('order_items');
        Schema::rename('order_items_mongodb_tmp', 'order_items');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty because MongoDB product IDs are string-based
        // and this schema change is not safely reversible to the old SQL foreign key.
    }
};
