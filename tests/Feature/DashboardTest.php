<?php

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Transacao;
use App\Models\User;
use Illuminate\Support\Carbon;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard returns all expected props', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('patrimonio_total')
            ->has('receitas_mes')
            ->has('despesas_mes')
            ->has('balanco_mes')
            ->has('contas')
            ->has('fluxo_mensal')
            ->has('despesas_categoria')
            ->has('transacoes_agendadas')
        );
});

test('patrimonio_total sums saldo_atual of active accounts', function () {
    $user = User::factory()->create();

    Conta::factory()->create([
        'user_id' => $user->id,
        'saldo_atual' => 1000,
        'saldo_inicial' => 1000,
        'is_active' => true,
    ]);

    Conta::factory()->create([
        'user_id' => $user->id,
        'saldo_atual' => 500,
        'saldo_inicial' => 500,
        'is_active' => true,
    ]);

    Conta::factory()->create([
        'user_id' => $user->id,
        'saldo_atual' => 999,
        'saldo_inicial' => 999,
        'is_active' => false,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('patrimonio_total', 1500)
        );
});

test('receitas_mes and despesas_mes only count current month realized transactions', function () {
    $user = User::factory()->create();
    $conta = Conta::factory()->create(['user_id' => $user->id, 'saldo_inicial' => 0, 'saldo_atual' => 0]);
    $categoria = Categoria::factory()->create(['user_id' => $user->id]);

    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'tipo' => TransacaoTipo::Receita,
        'status' => TransacaoStatus::Realizada,
        'valor_transacao' => 300,
        'data_transacao' => Carbon::today(),
    ]);

    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'tipo' => TransacaoTipo::Despesa,
        'status' => TransacaoStatus::Realizada,
        'valor_transacao' => 100,
        'data_transacao' => Carbon::today(),
    ]);

    // Agendada must be ignored
    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'tipo' => TransacaoTipo::Receita,
        'status' => TransacaoStatus::Agendada,
        'valor_transacao' => 9999,
        'data_transacao' => Carbon::today(),
    ]);

    // Last month must be ignored
    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'tipo' => TransacaoTipo::Receita,
        'status' => TransacaoStatus::Realizada,
        'valor_transacao' => 9999,
        'data_transacao' => Carbon::today()->subMonth(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('receitas_mes', 300)
            ->where('despesas_mes', 100)
            ->where('balanco_mes', 200)
        );
});

test('transacoes_agendadas returns only scheduled transactions ordered by date', function () {
    $user = User::factory()->create();
    $conta = Conta::factory()->create(['user_id' => $user->id, 'saldo_inicial' => 0, 'saldo_atual' => 0]);
    $categoria = Categoria::factory()->create(['user_id' => $user->id]);

    $future = Carbon::today()->addDays(5);
    $sooner = Carbon::today()->addDays(1);

    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'status' => TransacaoStatus::Agendada,
        'data_transacao' => $future,
    ]);

    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'status' => TransacaoStatus::Agendada,
        'data_transacao' => $sooner,
    ]);

    Transacao::factory()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'status' => TransacaoStatus::Realizada,
        'data_transacao' => Carbon::today(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('transacoes_agendadas', 2)
            ->where('transacoes_agendadas.0.data_transacao', $sooner->format('Y-m-d'))
            ->where('transacoes_agendadas.1.data_transacao', $future->format('Y-m-d'))
        );
});

test('fluxo_mensal returns 12 months of data', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('fluxo_mensal', 12)
        );
});

test('user cannot see data from other users', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    Conta::factory()->create([
        'user_id' => $userA->id,
        'saldo_atual' => 9999,
        'saldo_inicial' => 9999,
        'is_active' => true,
    ]);

    $this->actingAs($userB)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('patrimonio_total', 0)
            ->has('contas', 0)
        );
});
