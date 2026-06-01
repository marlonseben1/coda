<?php

namespace App\Models;

use App\Enums\CategoriaTipo;
use Database\Factories\CategoriaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'categoria_pai_id', 'nome', 'icone', 'tipo', 'is_active'])]
class Categoria extends Model
{
    /** @use HasFactory<CategoriaFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tipo' => CategoriaTipo::class,
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categoriaPai(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_pai_id');
    }

    public function subcategorias(): HasMany
    {
        return $this->hasMany(Categoria::class, 'categoria_pai_id');
    }
}
