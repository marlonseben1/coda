<?php

use App\Http\Controllers\ContaController;
use App\Http\Controllers\TransferenciaController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('extrato', 'extrato')->name('extrato');
    Route::inertia('assinaturas', 'assinaturas')->name('assinaturas');
    Route::get('contas', [ContaController::class, 'index'])->name('contas');
    Route::post('contas', [ContaController::class, 'store'])->name('contas.store');
    Route::put('contas/{conta}', [ContaController::class, 'update'])->name('contas.update');
    Route::delete('contas/{conta}', [ContaController::class, 'destroy'])->name('contas.destroy');
    Route::get('transferencias', [TransferenciaController::class, 'index'])->name('transferencias');
    Route::post('transferencias', [TransferenciaController::class, 'store'])->name('transferencias.store');
    Route::inertia('categorias', 'categorias')->name('categorias');
});

require __DIR__.'/settings.php';
