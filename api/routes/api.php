<?php

use App\Http\Controllers\Api\ContactController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider or bootstrap/app.php
| within a group which is assigned the "api" middleware group.
|
*/

// Health check endpoint
Route::get('/health', [ContactController::class, 'health']);

// Contact form submission endpoint (rate limited to 10 attempts per minute)
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:10,1');
