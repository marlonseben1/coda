<?php

namespace Database\Factories;

use App\Enums\ContaBanco;
use App\Enums\ContaTipo;
use App\Models\Conta;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conta>
 */
class ContaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $saldo = fake()->randomFloat(2, 0, 10000);

        return [
            'user_id' => User::factory(),
            'nome' => fake()->words(2, true),
            'tipo' => fake()->randomElement(ContaTipo::cases()),
            'banco' => fake()->randomElement(ContaBanco::cases()),
            'saldo_inicial' => $saldo,
            'saldo_atual' => $saldo,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
