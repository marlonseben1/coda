<?php

namespace App\Enums;

enum ContaBanco: int
{
    case Nubank = 1;
    case BancoDoBrasil = 2;
    case Itau = 3;
    case Inter = 4;
    case Sicredi = 5;
    case Santander = 6;

    public function label(): string
    {
        return match ($this) {
            self::Nubank => 'Nubank',
            self::BancoDoBrasil => 'Banco do Brasil',
            self::Itau => 'Itaú',
            self::Inter => 'Inter',
            self::Sicredi => 'Sicredi',
            self::Santander => 'Santander',
        };
    }
}
