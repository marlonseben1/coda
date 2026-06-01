<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaRequest;
use App\Http\Requests\UpdateCategoriaRequest;
use App\Models\Categoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaController extends Controller
{
    public function index(Request $request): Response
    {
        $mapCategoria = fn (Categoria $categoria) => [
            'id' => $categoria->id,
            'nome' => $categoria->nome,
            'icone' => $categoria->icone,
            'tipo' => $categoria->tipo->value,
            'tipo_label' => $categoria->tipo->label(),
            'categoria_pai_id' => $categoria->categoria_pai_id,
            'categoria_pai_nome' => $categoria->categoriaPai?->nome,
        ];

        $categorias = Categoria::with('categoriaPai')
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map($mapCategoria);

        return Inertia::render('categorias', [
            'categorias' => $categorias,
        ]);
    }

    public function store(StoreCategoriaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Categoria::create([
            'user_id' => $request->user()->id,
            'nome' => $validated['nome'],
            'icone' => $validated['icone'] ?? null,
            'tipo' => $validated['tipo'],
            'categoria_pai_id' => $validated['categoria_pai_id'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoria criada com sucesso.']);

        return to_route('categorias');
    }

    public function update(UpdateCategoriaRequest $request, Categoria $categoria): RedirectResponse
    {
        abort_if($categoria->user_id !== $request->user()->id, 403);

        $validated = $request->validated();

        $categoria->update([
            'nome' => $validated['nome'],
            'icone' => $validated['icone'] ?? null,
            'tipo' => $validated['tipo'],
            'categoria_pai_id' => $validated['categoria_pai_id'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoria atualizada com sucesso.']);

        return to_route('categorias');
    }

    public function destroy(Request $request, Categoria $categoria): RedirectResponse
    {
        abort_if($categoria->user_id !== $request->user()->id, 403);

        $categoria->update(['is_active' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoria desativada com sucesso.']);

        return to_route('categorias');
    }
}
