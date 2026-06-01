<?php

use App\Enums\CategoriaTipo;
use App\Models\Categoria;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('categorias'))->assertRedirect(route('login'));
});

test('authenticated users can visit the categorias page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('categorias'))
        ->assertOk();
});

test('user can create a categoria', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('categorias.store'), [
        'nome' => 'Alimentação',
        'icone' => 'Utensils',
        'tipo' => CategoriaTipo::Despesa->value,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categorias'));

    $categoria = Categoria::where('user_id', $user->id)->first();

    expect($categoria)->not->toBeNull();
    expect($categoria->nome)->toBe('Alimentação');
    expect($categoria->icone)->toBe('Utensils');
    expect($categoria->tipo)->toBe(CategoriaTipo::Despesa);
    expect($categoria->categoria_pai_id)->toBeNull();
    expect($categoria->is_active)->toBeTrue();
});

test('user can create a subcategoria', function () {
    $user = User::factory()->create();
    $pai = Categoria::factory()->despesa()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('categorias.store'), [
        'nome' => 'Restaurante',
        'tipo' => CategoriaTipo::Despesa->value,
        'categoria_pai_id' => $pai->id,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categorias'));

    $subcategoria = Categoria::where('user_id', $user->id)->where('categoria_pai_id', $pai->id)->first();

    expect($subcategoria)->not->toBeNull();
    expect($subcategoria->nome)->toBe('Restaurante');
    expect($subcategoria->categoria_pai_id)->toBe($pai->id);
});

test('user cannot use categoria_pai from another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $categoriaPaiDeB = Categoria::factory()->create(['user_id' => $userB->id]);

    $this->actingAs($userA)->post(route('categorias.store'), [
        'nome' => 'Tentativa',
        'tipo' => CategoriaTipo::Despesa->value,
        'categoria_pai_id' => $categoriaPaiDeB->id,
    ])->assertSessionHasErrors('categoria_pai_id');
});

test('user can update a categoria', function () {
    $user = User::factory()->create();
    $categoria = Categoria::factory()->despesa()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->put(route('categorias.update', $categoria), [
        'nome' => 'Novo Nome',
        'icone' => 'Home',
        'tipo' => CategoriaTipo::Receita->value,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categorias'));

    expect($categoria->fresh()->nome)->toBe('Novo Nome');
    expect($categoria->fresh()->icone)->toBe('Home');
    expect($categoria->fresh()->tipo)->toBe(CategoriaTipo::Receita);
});

test('user cannot update categoria from another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $categoria = Categoria::factory()->create(['user_id' => $userB->id]);

    $this->actingAs($userA)->put(route('categorias.update', $categoria), [
        'nome' => 'Hack',
        'icone' => 'ShoppingCart',
        'tipo' => CategoriaTipo::Despesa->value,
    ])->assertForbidden();
});

test('user can deactivate a categoria', function () {
    $user = User::factory()->create();
    $categoria = Categoria::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('categorias.destroy', $categoria))
        ->assertRedirect(route('categorias'));

    expect($categoria->fresh()->is_active)->toBeFalse();
});

test('user cannot deactivate categoria from another user', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $categoria = Categoria::factory()->create(['user_id' => $userB->id]);

    $this->actingAs($userA)
        ->delete(route('categorias.destroy', $categoria))
        ->assertForbidden();
});

test('inactive categorias are not returned in the listing', function () {
    $user = User::factory()->create();
    Categoria::factory()->inactive()->create(['user_id' => $user->id, 'nome' => 'Inativa']);
    Categoria::factory()->create(['user_id' => $user->id, 'nome' => 'Ativa']);

    $response = $this->actingAs($user)->get(route('categorias'));

    $response->assertInertia(
        fn ($page) => $page
            ->has('categorias', 1)
            ->where('categorias.0.nome', 'Ativa')
    );
});

test('user cannot create more than 25 categorias pai', function () {
    $user = User::factory()->create();
    Categoria::factory()->count(25)->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('categorias.store'), [
        'nome' => 'Extra',
        'icone' => 'Home',
        'tipo' => CategoriaTipo::Despesa->value,
    ])->assertSessionHasErrors('categoria_pai_id');
});

test('user cannot create more than 5 subcategorias per pai', function () {
    $user = User::factory()->create();
    $pai = Categoria::factory()->despesa()->create(['user_id' => $user->id]);
    Categoria::factory()->count(5)->create(['user_id' => $user->id, 'categoria_pai_id' => $pai->id]);

    $this->actingAs($user)->post(route('categorias.store'), [
        'nome' => 'Extra',
        'tipo' => CategoriaTipo::Despesa->value,
        'categoria_pai_id' => $pai->id,
    ])->assertSessionHasErrors('categoria_pai_id');
});

test('user cannot see categorias from other users', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    Categoria::factory()->create(['user_id' => $userB->id]);

    $response = $this->actingAs($userA)->get(route('categorias'));

    $response->assertInertia(
        fn ($page) => $page->has('categorias', 0)
    );
});
