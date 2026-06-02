<?php

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Transacao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function criarContexto(): array
{
    $user = User::factory()->create();
    $conta = Conta::factory()->create(['user_id' => $user->id, 'saldo_atual' => 1000.00]);
    $categoria = Categoria::factory()->create(['user_id' => $user->id]);

    return compact('user', 'conta', 'categoria');
}

function dadosTransacao(Conta $conta, Categoria $categoria, array $overrides = []): array
{
    return array_merge([
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'tipo' => TransacaoTipo::Despesa->value,
        'descricao' => 'Teste de transação',
        'data_transacao' => '2026-06-01',
        'valor_transacao' => 100.00,
        'status' => TransacaoStatus::Realizada->value,
    ], $overrides);
}

// --- store ---

it('cria uma despesa realizada e debita o saldo da conta', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $this->actingAs($user)
        ->post(route('transacoes.store'), dadosTransacao($conta, $categoria))
        ->assertRedirect();

    expect(Transacao::count())->toBe(1);
    expect($conta->fresh()->saldo_atual)->toBe('900.00');
});

it('cria uma receita realizada e credita o saldo da conta', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $this->actingAs($user)
        ->post(route('transacoes.store'), dadosTransacao($conta, $categoria, ['tipo' => TransacaoTipo::Receita->value]))
        ->assertRedirect();

    expect($conta->fresh()->saldo_atual)->toBe('1100.00');
});

it('cria uma transação agendada sem alterar o saldo', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $this->actingAs($user)
        ->post(route('transacoes.store'), dadosTransacao($conta, $categoria, ['status' => TransacaoStatus::Agendada->value]))
        ->assertRedirect();

    expect(Transacao::count())->toBe(1);
    expect($conta->fresh()->saldo_atual)->toBe('1000.00');
});

it('não permite criar transação com conta de outro usuário', function () {
    ['user' => $user, 'categoria' => $categoria] = criarContexto();
    $outraConta = Conta::factory()->create();

    $this->actingAs($user)
        ->post(route('transacoes.store'), dadosTransacao($outraConta, $categoria))
        ->assertSessionHasErrors(['conta_id']);
});

it('valida campos obrigatórios no store', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('transacoes.store'), [])
        ->assertSessionHasErrors(['conta_id', 'categoria_id', 'tipo', 'descricao', 'data_transacao', 'valor_transacao', 'status']);
});

// --- update ---

it('atualiza transação revertendo e aplicando saldo corretamente', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $transacao = Transacao::factory()->despesa()->realizada()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'valor_transacao' => 200.00,
    ]);
    $conta->update(['saldo_atual' => 800.00]);

    $this->actingAs($user)
        ->put(route('transacoes.update', $transacao), dadosTransacao($conta, $categoria, [
            'tipo' => TransacaoTipo::Despesa->value,
            'valor_transacao' => 300.00,
        ]));

    expect($conta->fresh()->saldo_atual)->toBe('700.00');
});

it('atualizar transação agendada para realizada aplica o saldo', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $transacao = Transacao::factory()->despesa()->agendada()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'valor_transacao' => 100.00,
    ]);

    $this->actingAs($user)
        ->put(route('transacoes.update', $transacao), dadosTransacao($conta, $categoria, [
            'tipo' => TransacaoTipo::Despesa->value,
            'status' => TransacaoStatus::Realizada->value,
        ]));

    expect($conta->fresh()->saldo_atual)->toBe('900.00');
});

it('não permite atualizar transação de outro usuário', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();
    $transacao = Transacao::factory()->create();

    $this->actingAs($user)
        ->put(route('transacoes.update', $transacao), dadosTransacao($conta, $categoria))
        ->assertStatus(403);
});

// --- destroy ---

it('remove transação realizada e reverte o saldo', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $transacao = Transacao::factory()->despesa()->realizada()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'valor_transacao' => 250.00,
    ]);
    $conta->update(['saldo_atual' => 750.00]);

    $this->actingAs($user)
        ->delete(route('transacoes.destroy', $transacao));

    expect(Transacao::count())->toBe(0);
    expect($conta->fresh()->saldo_atual)->toBe('1000.00');
});

it('remove transação agendada sem alterar o saldo', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    $transacao = Transacao::factory()->despesa()->agendada()->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'valor_transacao' => 100.00,
    ]);

    $this->actingAs($user)->delete(route('transacoes.destroy', $transacao));

    expect(Transacao::count())->toBe(0);
    expect($conta->fresh()->saldo_atual)->toBe('1000.00');
});

it('não permite remover transação de outro usuário', function () {
    $user = User::factory()->create();
    $transacao = Transacao::factory()->create();

    $this->actingAs($user)
        ->delete(route('transacoes.destroy', $transacao))
        ->assertStatus(403);
});

// --- index ---

it('retorna apenas transações do usuário autenticado', function () {
    ['user' => $user, 'conta' => $conta, 'categoria' => $categoria] = criarContexto();

    Transacao::factory()->count(3)->create([
        'user_id' => $user->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
    ]);
    Transacao::factory()->count(2)->create();

    $response = $this->actingAs($user)->get(route('extrato'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('transacoes.total', 3));
});
