<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DumpsController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/server/ping', [DumpsController::class, 'ping']);
Route::get('/server/stream', [DumpsController::class, 'stream']);
Route::get('/server/stop', [DumpsController::class, 'stop']);

Route::get('/test', fn() => view('test'));
Route::get('/dump', [DumpsController::class, 'dump']);
