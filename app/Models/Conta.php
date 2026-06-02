<?php

namespace App\Models;

use App\Enums\ContaBanco;
use App\Enums\ContaTipo;
use Database\Factories\ContaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'nome', 'tipo', 'banco', 'saldo_inicial', 'saldo_atual', 'is_active'])]
class Conta extends Model
{
    /** @use HasFactory<ContaFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tipo' => ContaTipo::class,
            'banco' => ContaBanco::class,
            'saldo_inicial' => 'decimal:2',
            'saldo_atual' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
