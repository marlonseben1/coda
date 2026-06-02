<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ContaController;
use App\Http\Controllers\TransacaoController;
use App\Http\Controllers\TransferenciaController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('extrato', [TransacaoController::class, 'index'])->name('extrato');
    Route::get('transacoes/create', [TransacaoController::class, 'create'])->name('transacoes.create');
    Route::post('transacoes', [TransacaoController::class, 'store'])->name('transacoes.store');
    Route::put('transacoes/{transacao}', [TransacaoController::class, 'update'])->name('transacoes.update');
    Route::delete('transacoes/{transacao}', [TransacaoController::class, 'destroy'])->name('transacoes.destroy');
    Route::inertia('assinaturas', 'assinaturas')->name('assinaturas');
    Route::get('contas', [ContaController::class, 'index'])->name('contas');
    Route::post('contas', [ContaController::class, 'store'])->name('contas.store');
    Route::put('contas/{conta}', [ContaController::class, 'update'])->name('contas.update');
    Route::delete('contas/{conta}', [ContaController::class, 'destroy'])->name('contas.destroy');
    Route::get('transferencias', [TransferenciaController::class, 'index'])->name('transferencias');
    Route::post('transferencias', [TransferenciaController::class, 'store'])->name('transferencias.store');
    Route::get('categorias', [CategoriaController::class, 'index'])->name('categorias');
    Route::post('categorias', [CategoriaController::class, 'store'])->name('categorias.store');
    Route::put('categorias/{categoria}', [CategoriaController::class, 'update'])->name('categorias.update');
    Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy'])->name('categorias.destroy');
});

require __DIR__.'/settings.php';
