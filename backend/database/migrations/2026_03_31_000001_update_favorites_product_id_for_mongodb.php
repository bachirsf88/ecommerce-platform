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
        if (! Schema::hasTable('favorites')) {
            return;
        }

        Schema::disableForeignKeyConstraints();

        Schema::create('favorites_mongodb_tmp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('product_id');
            $table->timestamps();

            $table->unique(['user_id', 'product_id']);
        });

        $favorites = DB::table('favorites')
            ->select([
                'id',
                'user_id',
                'product_id',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->get();

        foreach ($favorites as $favorite) {
            DB::table('favorites_mongodb_tmp')->insert([
                'id' => $favorite->id,
                'user_id' => $favorite->user_id,
                'product_id' => (string) $favorite->product_id,
                'created_at' => $favorite->created_at,
                'updated_at' => $favorite->updated_at,
            ]);
        }

        Schema::drop('favorites');
        Schema::rename('favorites_mongodb_tmp', 'favorites');

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
