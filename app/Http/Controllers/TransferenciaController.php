<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransferenciaRequest;
use App\Models\Conta;
use App\Models\Transferencia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransferenciaController extends Controller
{
    public function index(Request $request): Response
    {
        $contas = Conta::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get()
            ->map(fn (Conta $conta) => [
                'id' => $conta->id,
                'nome' => $conta->nome,
                'tipo' => $conta->tipo->value,
                'tipo_label' => $conta->tipo->label(),
                'banco' => $conta->banco->value,
                'banco_label' => $conta->banco->label(),
                'saldo_inicial' => $conta->saldo_inicial,
                'saldo_atual' => $conta->saldo_atual,
            ]);

        $sort = in_array($request->query('sort'), ['asc', 'desc']) ? $request->query('sort') : 'desc';
        $orderBy = in_array($request->query('order_by'), ['data', 'valor']) ? $request->query('order_by') : 'data';
        $column = $orderBy === 'valor' ? 'valor_transferencia' : 'data_transferencia';

        $transferencias = Transferencia::where('user_id', $request->user()->id)
            ->with(['fromAccount', 'toAccount'])
            ->orderBy($column, $sort)
            ->orderBy('id', $sort)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Transferencia $t) => [
                'id' => $t->id,
                'from_account' => $t->fromAccount->nome,
                'to_account' => $t->toAccount->nome,
                'valor_transferencia' => $t->valor_transferencia,
                'data_transferencia' => $t->data_transferencia->format('Y-m-d'),
            ]);

        return Inertia::render('transferencias', [
            'contas' => $contas,
            'transferencias' => $transferencias,
            'sort' => $sort,
            'orderBy' => $orderBy,
        ]);
    }

    public function store(StoreTransferenciaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $fromConta = Conta::find($validated['from_account_id']);
        $toConta = Conta::find($validated['to_account_id']);

        abort_if($fromConta->user_id !== $request->user()->id, 403);
        abort_if($toConta->user_id !== $request->user()->id, 403);
        abort_if(
            (float) $fromConta->saldo_atual < $validated['valor_transferencia'],
            422,
            'Saldo insuficiente na conta de origem.'
        );

        DB::transaction(function () use ($validated, $fromConta, $toConta, $request) {
            $fromConta->decrement('saldo_atual', $validated['valor_transferencia']);
            $toConta->increment('saldo_atual', $validated['valor_transferencia']);

            Transferencia::create([
                'user_id' => $request->user()->id,
                'from_account_id' => $validated['from_account_id'],
                'to_account_id' => $validated['to_account_id'],
                'valor_transferencia' => $validated['valor_transferencia'],
                'data_transferencia' => $validated['data_transferencia'],
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transferência realizada com sucesso.']);

        return redirect()->back();
    }
}
