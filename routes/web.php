<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('extrato', 'extrato')->name('extrato');
    Route::inertia('assinaturas', 'assinaturas')->name('assinaturas');
    Route::inertia('contas', 'contas')->name('contas');
    Route::inertia('categorias', 'categorias')->name('categorias');
});

require __DIR__ . '/settings.php';
