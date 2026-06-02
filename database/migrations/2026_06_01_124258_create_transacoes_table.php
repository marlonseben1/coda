<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conta_id')->constrained('contas')->restrictOnDelete();
            $table->foreignId('categoria_id')->constrained('categorias')->restrictOnDelete();
            $table->unsignedTinyInteger('tipo');
            $table->string('descricao');
            $table->date('data_transacao');
            $table->decimal('valor_transacao', 10, 2);
            $table->unsignedTinyInteger('status')->default(2);
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'data_transacao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transacoes');
    }
};
