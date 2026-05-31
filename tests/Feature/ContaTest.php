<?php

use App\Enums\ContaBanco;
use App\Enums\ContaTipo;
use App\Models\Conta;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('contas'))->assertRedirect(route('login'));
});

test('authenticated users can visit the contas page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('contas'))
        ->assertOk();
});

test('user can create a conta', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('contas.store'), [
        'nome' => 'Conta Nubank',
        'saldo_inicial' => 1500.00,
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('contas'));

    $conta = Conta::where('user_id', $user->id)->first();

    expect($conta)->not->toBeNull();
    expect($conta->nome)->toBe('Conta Nubank');
    expect($conta->tipo)->toBe(ContaTipo::Corrente);
    expect($conta->banco)->toBe(ContaBanco::Nubank);
    expect((float) $conta->saldo_inicial)->toBe(1500.00);
    expect((float) $conta->saldo_atual)->toBe(1500.00);
    expect($conta->is_active)->toBeTrue();
});

test('saldo_atual starts equal to saldo_inicial', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('contas.store'), [
        'nome' => 'Poupança',
        'saldo_inicial' => 300.50,
        'tipo' => ContaTipo::Poupanca->value,
        'banco' => ContaBanco::Inter->value,
    ]);

    $conta = Conta::where('user_id', $user->id)->first();

    expect((float) $conta->saldo_atual)->toBe((float) $conta->saldo_inicial);
});

test('user cannot see contas from other users', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    Conta::create([
        'user_id' => $userA->id,
        'nome' => 'Conta do A',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 100,
        'saldo_atual' => 100,
    ]);

    $this->actingAs($userB)
        ->get(route('contas'))
        ->assertOk();

    expect(Conta::where('user_id', $userB->id)->count())->toBe(0);
});

test('nome is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'saldo_inicial' => 100,
            'tipo' => ContaTipo::Corrente->value,
            'banco' => ContaBanco::Nubank->value,
        ])
        ->assertSessionHasErrors('nome');
});

test('banco is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'nome' => 'Test',
            'saldo_inicial' => 100,
            'tipo' => ContaTipo::Corrente->value,
        ])
        ->assertSessionHasErrors('banco');
});

test('banco must be a valid ContaBanco value', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'nome' => 'Test',
            'saldo_inicial' => 100,
            'tipo' => ContaTipo::Corrente->value,
            'banco' => 99,
        ])
        ->assertSessionHasErrors('banco');
});

test('saldo_inicial is required and must be non-negative', function (mixed $value) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'nome' => 'Test',
            'saldo_inicial' => $value,
            'tipo' => ContaTipo::Corrente->value,
            'banco' => ContaBanco::Nubank->value,
        ])
        ->assertSessionHasErrors('saldo_inicial');
})->with([
    'missing' => [null],
    'negative' => [-1],
    'non-numeric' => ['abc'],
]);

test('tipo must be a valid ContaTipo value', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('contas.store'), [
            'nome' => 'Test',
            'saldo_inicial' => 100,
            'tipo' => 'invalido',
            'banco' => ContaBanco::Nubank->value,
        ])
        ->assertSessionHasErrors('tipo');
});

test('user can update a conta', function () {
    $user = User::factory()->create();

    $conta = Conta::create([
        'user_id' => $user->id,
        'nome' => 'Conta Original',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 500,
        'saldo_atual' => 500,
    ]);

    $response = $this->actingAs($user)->put(route('contas.update', $conta), [
        'nome' => 'Conta Atualizada',
        'tipo' => ContaTipo::Poupanca->value,
        'banco' => ContaBanco::Inter->value,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('contas'));

    $conta->refresh();

    expect($conta->nome)->toBe('Conta Atualizada');
    expect($conta->tipo)->toBe(ContaTipo::Poupanca);
    expect($conta->banco)->toBe(ContaBanco::Inter);
});

test('user cannot update another user conta', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $conta = Conta::create([
        'user_id' => $userA->id,
        'nome' => 'Conta do A',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 100,
        'saldo_atual' => 100,
    ]);

    $this->actingAs($userB)
        ->put(route('contas.update', $conta), [
            'nome' => 'Tentativa',
            'tipo' => ContaTipo::Corrente->value,
            'banco' => ContaBanco::Nubank->value,
        ])
        ->assertForbidden();
});

test('user can deactivate a conta with zero saldo', function () {
    $user = User::factory()->create();

    $conta = Conta::create([
        'user_id' => $user->id,
        'nome' => 'Conta Zerada',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 0,
        'saldo_atual' => 0,
    ]);

    $response = $this->actingAs($user)->delete(route('contas.destroy', $conta));

    $response->assertSessionHasNoErrors()->assertRedirect(route('contas'));

    expect($conta->refresh()->is_active)->toBeFalse();
});

test('user cannot deactivate a conta with non-zero saldo', function () {
    $user = User::factory()->create();

    $conta = Conta::create([
        'user_id' => $user->id,
        'nome' => 'Conta com Saldo',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 500,
        'saldo_atual' => 500,
    ]);

    $this->actingAs($user)
        ->delete(route('contas.destroy', $conta))
        ->assertStatus(422);

    expect($conta->refresh()->is_active)->toBeTrue();
});

test('user cannot deactivate another user conta', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $conta = Conta::create([
        'user_id' => $userA->id,
        'nome' => 'Conta do A',
        'tipo' => ContaTipo::Corrente->value,
        'banco' => ContaBanco::Nubank->value,
        'saldo_inicial' => 0,
        'saldo_atual' => 0,
    ]);

    $this->actingAs($userB)
        ->delete(route('contas.destroy', $conta))
        ->assertForbidden();
});
