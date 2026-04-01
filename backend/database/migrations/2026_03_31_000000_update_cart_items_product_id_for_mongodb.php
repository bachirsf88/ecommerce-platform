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
        if (! Schema::hasTable('cart_items')) {
            return;
        }

        Schema::disableForeignKeyConstraints();

        Schema::create('cart_items_mongodb_tmp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->string('product_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->unique(['cart_id', 'product_id']);
        });

        $cartItems = DB::table('cart_items')
            ->select([
                'id',
                'cart_id',
                'product_id',
                'quantity',
                'unit_price',
                'subtotal',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->get();

        foreach ($cartItems as $cartItem) {
            DB::table('cart_items_mongodb_tmp')->insert([
                'id' => $cartItem->id,
                'cart_id' => $cartItem->cart_id,
                'product_id' => (string) $cartItem->product_id,
                'quantity' => $cartItem->quantity,
                'unit_price' => $cartItem->unit_price,
                'subtotal' => $cartItem->subtotal,
                'created_at' => $cartItem->created_at,
                'updated_at' => $cartItem->updated_at,
            ]);
        }

        Schema::drop('cart_items');
        Schema::rename('cart_items_mongodb_tmp', 'cart_items');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty.
        // MongoDB product IDs are string-based, so converting this column
        // back to the old SQL foreign key format is not safely reversible.
    }
};
