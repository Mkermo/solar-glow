<?php

use App\Http\Controllers\Api\AssistantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::get('/orders/{reference}', [OrderController::class, 'show']);
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/contact', [ContactMessageController::class, 'store']);
});

// The assistant calls the Claude API per request, so keep it on a tighter limit.
Route::middleware('throttle:15,1')->group(function () {
    Route::post('/assistant/chat', [AssistantController::class, 'chat']);
});
