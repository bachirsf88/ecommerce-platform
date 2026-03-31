<?php

use App\Http\Controllers\API\Admin\AdminController;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Cart\CartController;
use App\Http\Controllers\API\Favorite\FavoriteController;
use App\Http\Controllers\API\Order\OrderController;
use App\Http\Controllers\API\Product\ProductController;
use App\Http\Controllers\API\Seller\SellerOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->get('/admin/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin test route accessed successfully.',
        'data' => null,
    ]);
});

Route::middleware(['auth:sanctum', 'role:seller,buyer'])->get('/user/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Seller or buyer test route accessed successfully.',
        'data' => null,
    ]);
});

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/filter', [ProductController::class, 'filter']);
    Route::get('/{id}', [ProductController::class, 'show']);

    Route::middleware(['auth:sanctum', 'role:seller'])->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::put('/{product}', [ProductController::class, 'update']);
        Route::delete('/{product}', [ProductController::class, 'destroy']);
    });
});

Route::prefix('cart')->middleware(['auth:sanctum', 'role:buyer'])->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'add']);
    Route::put('/item/{id}', [CartController::class, 'updateItem']);
    Route::delete('/item/{id}', [CartController::class, 'removeItem']);
});

Route::prefix('favorites')->middleware(['auth:sanctum', 'role:buyer'])->group(function () {
    Route::get('/', [FavoriteController::class, 'index']);
    Route::post('/', [FavoriteController::class, 'store']);
    Route::delete('/{productId}', [FavoriteController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:buyer'])->group(function () {
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

Route::prefix('seller/orders')->middleware(['auth:sanctum', 'role:seller'])->group(function () {
    Route::get('/', [SellerOrderController::class, 'index']);
    Route::get('/{id}', [SellerOrderController::class, 'show']);
    Route::put('/{id}/status', [SellerOrderController::class, 'updateStatus']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/sellers', [AdminController::class, 'sellers']);
    Route::put('/sellers/{id}/approve', [AdminController::class, 'approveSeller']);
    Route::get('/products', [AdminController::class, 'products']);
    Route::get('/orders', [AdminController::class, 'orders']);
});
