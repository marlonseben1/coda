<?php

namespace App\Http\Controllers;

use App\Enums\TransacaoStatus;
use App\Enums\TransacaoTipo;
use App\Models\Conta;
use App\Models\Transacao;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $hoje = Carbon::today();
        $inicioMes = $hoje->copy()->startOfMonth();
        $fimMes = $hoje->copy()->endOfMonth();

        $patrimonioTotal = Conta::where('user_id', $userId)
            ->where('is_active', true)
            ->sum('saldo_atual');

        $receitasMes = Transacao::where('user_id', $userId)
            ->where('tipo', TransacaoTipo::Receita)
            ->where('status', TransacaoStatus::Realizada)
            ->whereBetween('data_transacao', [$inicioMes, $fimMes])
            ->sum('valor_transacao');

        $despesasMes = Transacao::where('user_id', $userId)
            ->where('tipo', TransacaoTipo::Despesa)
            ->where('status', TransacaoStatus::Realizada)
            ->whereBetween('data_transacao', [$inicioMes, $fimMes])
            ->sum('valor_transacao');

        $balancoMes = (float) $receitasMes - (float) $despesasMes;

        $contas = Conta::where('user_id', $userId)
            ->where('is_active', true)
            ->get()
            ->map(fn (Conta $conta) => [
                'id' => $conta->id,
                'nome' => $conta->nome,
                'tipo_label' => $conta->tipo->label(),
                'banco_label' => $conta->banco->label(),
                'saldo_atual' => $conta->saldo_atual,
            ]);

        $fluxoMensal = $this->buildFluxoMensal($userId);

        $despesasCategoria = $this->buildDespesasCategoria($userId, $inicioMes, $fimMes);

        $receitasCategoria = $this->buildReceitasCategoria($userId, $inicioMes, $fimMes);

        $transacoesAgendadas = Transacao::where('user_id', $userId)
            ->where('status', TransacaoStatus::Agendada)
            ->with(['conta', 'categoria'])
            ->orderBy('data_transacao')
            ->limit(8)
            ->get()
            ->map(fn (Transacao $t) => [
                'id' => $t->id,
                'descricao' => $t->descricao,
                'conta' => $t->conta->nome,
                'categoria' => $t->categoria->nome,
                'categoria_icone' => $t->categoria->icone,
                'tipo' => $t->tipo->value,
                'data_transacao' => $t->data_transacao->format('Y-m-d'),
                'valor_transacao' => $t->valor_transacao,
            ]);

        return Inertia::render('dashboard', [
            'patrimonio_total' => (float) $patrimonioTotal,
            'receitas_mes' => (float) $receitasMes,
            'despesas_mes' => (float) $despesasMes,
            'balanco_mes' => $balancoMes,
            'contas' => $contas,
            'fluxo_mensal' => $fluxoMensal,
            'despesas_categoria' => $despesasCategoria,
            'receitas_categoria' => $receitasCategoria,
            'transacoes_agendadas' => $transacoesAgendadas,
        ]);
    }

    /**
     * @return array<int, array{mes: string, receitas: float, despesas: float}>
     */
    private function buildFluxoMensal(int $userId): array
    {
        $inicio = Carbon::today()->subMonths(11)->startOfMonth();

        $rows = Transacao::where('user_id', $userId)
            ->where('status', TransacaoStatus::Realizada)
            ->where('data_transacao', '>=', $inicio)
            ->selectRaw("strftime('%Y', data_transacao) as ano, strftime('%m', data_transacao) as mes, tipo, SUM(valor_transacao) as total")
            ->groupBy('ano', 'mes', 'tipo')
            ->orderBy('ano')
            ->orderBy('mes')
            ->get();

        $meses = [];
        for ($i = 11; $i >= 0; $i--) {
            $data = Carbon::today()->subMonths($i)->startOfMonth();
            $key = $data->format('Y-m');
            $meses[$key] = [
                'mes' => $data->format('m/y'),
                'receitas' => 0.0,
                'despesas' => 0.0,
            ];
        }

        foreach ($rows as $row) {
            $key = $row->ano.'-'.$row->mes;
            if (isset($meses[$key])) {
                if ($row->tipo === TransacaoTipo::Receita) {
                    $meses[$key]['receitas'] = (float) $row->total;
                } else {
                    $meses[$key]['despesas'] = (float) $row->total;
                }
            }
        }

        return array_values($meses);
    }

    /**
     * @return array<int, array{nome: string, total: float}>
     */
    private function buildReceitasCategoria(int $userId, Carbon $inicio, Carbon $fim): array
    {
        $rows = Transacao::where('user_id', $userId)
            ->where('tipo', TransacaoTipo::Receita)
            ->where('status', TransacaoStatus::Realizada)
            ->whereBetween('data_transacao', [$inicio, $fim])
            ->with('categoria.categoriaPai')
            ->selectRaw('categoria_id, SUM(valor_transacao) as total')
            ->groupBy('categoria_id')
            ->get();

        $agrupado = [];

        foreach ($rows as $row) {
            $categoria = $row->categoria;
            $nomePai = $categoria->categoriaPai?->nome ?? $categoria->nome;

            if (! isset($agrupado[$nomePai])) {
                $agrupado[$nomePai] = 0.0;
            }
            $agrupado[$nomePai] += (float) $row->total;
        }

        arsort($agrupado);

        $top9 = array_slice($agrupado, 0, 4, true);
        $outros = (float) array_sum(array_slice($agrupado, 4));

        if ($outros > 0) {
            $top9['Outros'] = $outros;
        }

        return collect($top9)
            ->map(fn (float $total, string $nome) => ['nome' => $nome, 'total' => $total])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{nome: string, total: float}>
     */
    private function buildDespesasCategoria(int $userId, Carbon $inicio, Carbon $fim): array
    {
        $rows = Transacao::where('user_id', $userId)
            ->where('tipo', TransacaoTipo::Despesa)
            ->where('status', TransacaoStatus::Realizada)
            ->whereBetween('data_transacao', [$inicio, $fim])
            ->with('categoria.categoriaPai')
            ->selectRaw('categoria_id, SUM(valor_transacao) as total')
            ->groupBy('categoria_id')
            ->get();

        $agrupado = [];

        foreach ($rows as $row) {
            $categoria = $row->categoria;
            $nomePai = $categoria->categoriaPai?->nome ?? $categoria->nome;

            if (! isset($agrupado[$nomePai])) {
                $agrupado[$nomePai] = 0.0;
            }
            $agrupado[$nomePai] += (float) $row->total;
        }

        arsort($agrupado);

        $top9 = array_slice($agrupado, 0, 4, true);
        $outros = (float) array_sum(array_slice($agrupado, 4));

        if ($outros > 0) {
            $top9['Outros'] = $outros;
        }

        return collect($top9)
            ->map(fn (float $total, string $nome) => ['nome' => $nome, 'total' => $total])
            ->values()
            ->all();
    }
}
