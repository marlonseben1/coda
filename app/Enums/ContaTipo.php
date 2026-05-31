<?php

namespace App\Enums;

enum ContaTipo: int
{
    case Corrente = 1;
    case Poupanca = 2;
    case Investimento = 3;

    public function label(): string
    {
        return match ($this) {
            self::Corrente => 'Corrente',
            self::Poupanca => 'Poupança',
            self::Investimento => 'Investimento',
        };
    }
}
