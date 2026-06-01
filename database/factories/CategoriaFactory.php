<?php

namespace Database\Factories;

use App\Enums\CategoriaTipo;
use App\Models\Categoria;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Categoria>
 */
class CategoriaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'categoria_pai_id' => null,
            'nome' => fake()->word(),
            'icone' => 'ShoppingCart',
            'tipo' => fake()->randomElement(CategoriaTipo::cases()),
            'is_active' => true,
        ];
    }

    public function despesa(): static
    {
        return $this->state(['tipo' => CategoriaTipo::Despesa]);
    }

    public function receita(): static
    {
        return $this->state(['tipo' => CategoriaTipo::Receita]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
