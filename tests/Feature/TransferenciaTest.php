<?php

use App\Enums\ContaBanco;
use App\Enums\ContaTipo;
use App\Models\Conta;
use App\Models\Transferencia;
use App\Models\User;

function criarConta(User $user, float $saldo = 1000.00): Conta
{
    return Conta::create([
        'user_id' => $user->id,
        'nome' => fake()->word(),
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => $saldo,
        'saldo_atual' => $saldo,
    ]);
}

test('guests are redirected to the login page', function () {
    $this->get(route('transferencias'))->assertRedirect(route('login'));
    $this->post(route('transferencias.store'))->assertRedirect(route('login'));
});

test('authenticated users can visit the transferencias page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('transferencias'))
        ->assertOk();
});

test('user can create a transferencia', function () {
    $user = User::factory()->create();
    $from = criarConta($user, 500.00);
    $to = criarConta($user, 100.00);

    $response = $this->actingAs($user)
        ->from(route('contas'))
        ->post(route('transferencias.store'), [
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'valor_transferencia' => 200.00,
            'data_transferencia' => '2026-05-31',
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('contas'));

    expect(Transferencia::where('user_id', $user->id)->count())->toBe(1);
});

test('saldos are updated correctly after transferencia', function () {
    $user = User::factory()->create();
    $from = criarConta($user, 500.00);
    $to = criarConta($user, 100.00);

    $this->actingAs($user)->post(route('transferencias.store'), [
        'from_account_id' => $from->id,
        'to_account_id' => $to->id,
        'valor_transferencia' => 200.00,
        'data_transferencia' => '2026-05-31',
    ]);

    expect((float) $from->refresh()->saldo_atual)->toBe(300.00);
    expect((float) $to->refresh()->saldo_atual)->toBe(300.00);
});

test('cannot transfer to the same account', function () {
    $user = User::factory()->create();
    $conta = criarConta($user);

    $this->actingAs($user)
        ->post(route('transferencias.store'), [
            'from_account_id' => $conta->id,
            'to_account_id' => $conta->id,
            'valor_transferencia' => 100.00,
            'data_transferencia' => '2026-05-31',
        ])
        ->assertSessionHasErrors('to_account_id');
});

test('cannot transfer with insufficient balance', function () {
    $user = User::factory()->create();
    $from = criarConta($user, 50.00);
    $to = criarConta($user, 0.00);

    $this->actingAs($user)
        ->post(route('transferencias.store'), [
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'valor_transferencia' => 200.00,
            'data_transferencia' => '2026-05-31',
        ])
        ->assertStatus(422);
});

test('cannot transfer using another user accounts', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $contaA1 = criarConta($userA);
    $contaA2 = criarConta($userA);

    $this->actingAs($userB)
        ->post(route('transferencias.store'), [
            'from_account_id' => $contaA1->id,
            'to_account_id' => $contaA2->id,
            'valor_transferencia' => 100.00,
            'data_transferencia' => '2026-05-31',
        ])
        ->assertForbidden();
});

test('valor_transferencia must be at least 0.01', function () {
    $user = User::factory()->create();
    $from = criarConta($user);
    $to = criarConta($user);

    $this->actingAs($user)
        ->post(route('transferencias.store'), [
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'valor_transferencia' => 0,
            'data_transferencia' => '2026-05-31',
        ])
        ->assertSessionHasErrors('valor_transferencia');
});
