<?php

namespace App\Enums;

enum TransacaoTipo: int
{
    case Receita = 1;
    case Despesa = 2;

    public function label(): string
    {
        return match ($this) {
            self::Receita => 'Receita',
            self::Despesa => 'Despesa',
        };
    }
}
