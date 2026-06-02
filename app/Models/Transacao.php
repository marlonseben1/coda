<?php

namespace App\Models;

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use Database\Factories\TransacaoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'conta_id', 'categoria_id', 'tipo', 'descricao', 'data_transacao', 'valor_transacao', 'status'])]
class Transacao extends Model
{
    /** @use HasFactory<TransacaoFactory> */
    use HasFactory;

    protected $table = 'transacoes';

    protected function casts(): array
    {
        return [
            'tipo' => TransacaoTipo::class,
            'status' => TransacaoStatus::class,
            'data_transacao' => 'date',
            'valor_transacao' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conta(): BelongsTo
    {
        return $this->belongsTo(Conta::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }
}
