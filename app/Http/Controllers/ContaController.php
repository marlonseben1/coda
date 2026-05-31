<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContaRequest;
use App\Http\Requests\UpdateContaRequest;
use App\Models\Conta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContaController extends Controller
{
    public function index(Request $request): Response
    {
        $mapConta = fn (Conta $conta) => [
            'id' => $conta->id,
            'nome' => $conta->nome,
            'tipo' => $conta->tipo->value,
            'tipo_label' => $conta->tipo->label(),
            'banco' => $conta->banco->value,
            'banco_label' => $conta->banco->label(),
            'saldo_inicial' => $conta->saldo_inicial,
            'saldo_atual' => $conta->saldo_atual,
        ];

        $query = Conta::where('user_id', $request->user()->id)
            ->where('is_active', true);

        $contas = $query->paginate(10)->through($mapConta);
        $contasSelect = $query->get()->map($mapConta);

        return Inertia::render('contas', [
            'contas' => $contas,
            'contasSelect' => $contasSelect,
        ]);
    }

    public function store(StoreContaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Conta::create([
            'user_id' => $request->user()->id,
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'],
            'banco' => $validated['banco'],
            'saldo_inicial' => $validated['saldo_inicial'],
            'saldo_atual' => $validated['saldo_inicial'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Conta criada com sucesso.']);

        return to_route('contas');
    }

    public function update(UpdateContaRequest $request, Conta $conta): RedirectResponse
    {
        abort_if($conta->user_id !== $request->user()->id, 403);

        $validated = $request->validated();

        $conta->update([
            'nome' => $validated['nome'],
            'tipo' => $validated['tipo'],
            'banco' => $validated['banco'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Conta atualizada com sucesso.']);

        return to_route('contas');
    }

    public function destroy(Request $request, Conta $conta): RedirectResponse
    {
        abort_if($conta->user_id !== $request->user()->id, 403);
        abort_if((float) $conta->saldo_atual !== 0.0, 422, 'Não é possível excluir uma conta com saldo.');

        $conta->update(['is_active' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Conta desativada com sucesso.']);

        return to_route('contas');
    }
}
