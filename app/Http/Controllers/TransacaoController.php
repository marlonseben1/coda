<?php

namespace App\Http\Controllers;

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use App\Http\Requests\StoreTransacaoRequest;
use App\Http\Requests\UpdateTransacaoRequest;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\Transacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransacaoController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $contas = Conta::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map(fn (Conta $conta) => ['id' => $conta->id, 'nome' => $conta->nome]);

        $categorias = Categoria::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map(fn (Categoria $c) => ['id' => $c->id, 'nome' => $c->nome, 'tipo' => $c->tipo->value]);

        return response()->json(compact('contas', 'categorias'));
    }

    public function index(Request $request): Response
    {
        $contas = Conta::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map(fn (Conta $conta) => [
                'id' => $conta->id,
                'nome' => $conta->nome,
            ]);

        $categorias = Categoria::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map(fn (Categoria $c) => [
                'id' => $c->id,
                'nome' => $c->nome,
                'tipo' => $c->tipo->value,
                'categoria_pai_id' => $c->categoria_pai_id,
            ]);

        $query = Transacao::where('user_id', $request->user()->id)
            ->with(['conta', 'categoria']);

        if ($request->filled('conta_id')) {
            $query->where('conta_id', (int) $request->query('conta_id'));
        }

        if ($request->filled('tipo') && in_array((int) $request->query('tipo'), array_column(TransacaoTipo::cases(), 'value'))) {
            $query->where('tipo', (int) $request->query('tipo'));
        }

        if ($request->filled('status') && in_array((int) $request->query('status'), array_column(TransacaoStatus::cases(), 'value'))) {
            $query->where('status', (int) $request->query('status'));
        }

        if ($request->filled('data_inicio')) {
            $query->whereDate('data_transacao', '>=', $request->query('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data_transacao', '<=', $request->query('data_fim'));
        }

        if ($request->filled('categoria_pai_id')) {
            $catPaiId = (int) $request->query('categoria_pai_id');
            $query->where(function ($q) use ($catPaiId): void {
                $q->where('categoria_id', $catPaiId)
                    ->orWhereHas('categoria', fn ($q2) => $q2->where('categoria_pai_id', $catPaiId));
            });
        }

        $sort = in_array($request->query('sort'), ['asc', 'desc']) ? $request->query('sort') : 'desc';
        $orderBy = in_array($request->query('order_by'), ['data', 'valor']) ? $request->query('order_by') : 'data';
        $column = $orderBy === 'valor' ? 'valor_transacao' : 'data_transacao';

        $transacoes = $query
            ->orderBy($column, $sort)
            ->orderBy('id', $sort)
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Transacao $t) => [
                'id' => $t->id,
                'conta' => $t->conta->nome,
                'conta_id' => $t->conta_id,
                'categoria' => $t->categoria->nome,
                'categoria_id' => $t->categoria_id,
                'categoria_icone' => $t->categoria->icone,
                'tipo' => $t->tipo->value,
                'tipo_label' => $t->tipo->label(),
                'descricao' => $t->descricao,
                'data_transacao' => $t->data_transacao->format('Y-m-d'),
                'valor_transacao' => $t->valor_transacao,
                'status' => $t->status->value,
                'status_label' => $t->status->label(),
            ]);

        return Inertia::render('extrato', [
            'contas' => $contas,
            'categorias' => $categorias,
            'transacoes' => $transacoes,
            'sort' => $sort,
            'orderBy' => $orderBy,
            'filters' => $request->only(['conta_id', 'tipo', 'status', 'categoria_pai_id', 'data_inicio', 'data_fim']),
        ]);
    }

    public function store(StoreTransacaoRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $conta = Conta::find($validated['conta_id']);

        abort_if($conta->user_id !== $request->user()->id, 403);

        DB::transaction(function () use ($validated, $conta, $request): void {
            $transacao = Transacao::create([
                'user_id' => $request->user()->id,
                ...$validated,
            ]);

            if ($transacao->status === TransacaoStatus::Realizada) {
                if ($transacao->tipo === TransacaoTipo::Receita) {
                    $conta->increment('saldo_atual', $validated['valor_transacao']);
                } else {
                    $conta->decrement('saldo_atual', $validated['valor_transacao']);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transação criada com sucesso.']);

        return redirect()->back();
    }

    public function update(UpdateTransacaoRequest $request, Transacao $transacao): RedirectResponse
    {
        abort_if($transacao->user_id !== $request->user()->id, 403);

        $validated = $request->validated();
        $contaAnterior = Conta::find($transacao->conta_id);
        $contaNova = Conta::find($validated['conta_id']);

        abort_if($contaNova->user_id !== $request->user()->id, 403);

        DB::transaction(function () use ($validated, $transacao, $contaAnterior, $contaNova): void {
            if ($transacao->status === TransacaoStatus::Realizada) {
                if ($transacao->tipo === TransacaoTipo::Receita) {
                    $contaAnterior->decrement('saldo_atual', (float) $transacao->valor_transacao);
                } else {
                    $contaAnterior->increment('saldo_atual', (float) $transacao->valor_transacao);
                }
            }

            $transacao->update($validated);

            if ($transacao->status === TransacaoStatus::Realizada) {
                if ($transacao->tipo === TransacaoTipo::Receita) {
                    $contaNova->increment('saldo_atual', $validated['valor_transacao']);
                } else {
                    $contaNova->decrement('saldo_atual', $validated['valor_transacao']);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transação atualizada com sucesso.']);

        return redirect()->back();
    }

    public function destroy(Request $request, Transacao $transacao): RedirectResponse
    {
        abort_if($transacao->user_id !== $request->user()->id, 403);

        DB::transaction(function () use ($transacao): void {
            if ($transacao->status === TransacaoStatus::Realizada) {
                $conta = $transacao->conta;

                if ($transacao->tipo === TransacaoTipo::Receita) {
                    $conta->decrement('saldo_atual', (float) $transacao->valor_transacao);
                } else {
                    $conta->increment('saldo_atual', (float) $transacao->valor_transacao);
                }
            }

            $transacao->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transação removida com sucesso.']);

        return redirect()->back();
    }
}
