<?php

namespace Database\Factories;

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Transacao;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transacao>
 */
class TransacaoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'conta_id' => Conta::factory(),
            'categoria_id' => Categoria::factory(),
            'tipo' => fake()->randomElement(TransacaoTipo::cases()),
            'descricao' => fake()->sentence(3),
            'data_transacao' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'valor_transacao' => fake()->randomFloat(2, 1, 5000),
            'status' => TransacaoStatus::Realizada,
        ];
    }

    public function receita(): static
    {
        return $this->state(['tipo' => TransacaoTipo::Receita]);
    }

    public function despesa(): static
    {
        return $this->state(['tipo' => TransacaoTipo::Despesa]);
    }

    public function agendada(): static
    {
        return $this->state(['status' => TransacaoStatus::Agendada]);
    }

    public function realizada(): static
    {
        return $this->state(['status' => TransacaoStatus::Realizada]);
    }
}
