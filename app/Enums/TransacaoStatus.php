<?php

namespace App\Enums;

enum TransacaoStatus: int
{
    case Agendada = 1;
    case Realizada = 2;

    public function label(): string
    {
        return match ($this) {
            self::Agendada => 'Agendada',
            self::Realizada => 'Realizada',
        };
    }
}
