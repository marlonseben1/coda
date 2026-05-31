<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'from_account_id', 'to_account_id', 'valor_transferencia', 'data_transferencia'])]
class Transferencia extends Model
{
    protected function casts(): array
    {
        return [
            'valor_transferencia' => 'decimal:2',
            'data_transferencia' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fromAccount(): BelongsTo
    {
        return $this->belongsTo(Conta::class, 'from_account_id');
    }

    public function toAccount(): BelongsTo
    {
        return $this->belongsTo(Conta::class, 'to_account_id');
    }
}
