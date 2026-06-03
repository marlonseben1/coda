import { Head } from '@inertiajs/react';
import { Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    CategoriaPieChartDialog,
    type CategoriaItem,
} from '@/components/categoria-pie-chart-dialog';
import {
    SaldosContaDialog,
    type ContaItem,
} from '@/components/saldos-conta-dialog';
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatSaldo } from '@/utils/currency/currency';
import { dashboard } from '@/routes';

interface FluxoMensal {
    mes: string;
    receitas: number;
    despesas: number;
}

interface TransacaoAgendada {
    id: number;
    descricao: string;
    conta: string;
    categoria: string;
    categoria_icone: string;
    tipo: number;
    data_transacao: string;
    valor_transacao: string;
}

interface Props {
    patrimonio_total: number;
    receitas_mes: number;
    despesas_mes: number;
    balanco_mes: number;
    contas: ContaItem[];
    fluxo_mensal: FluxoMensal[];
    despesas_categoria: CategoriaItem[];
    receitas_categoria: CategoriaItem[];
    transacoes_agendadas: TransacaoAgendada[];
}

const fluxoConfig: ChartConfig = {
    receitas: { label: 'Receitas', color: '#34d399' },
    despesas: { label: 'Despesas', color: '#f87171' },
};

function formatDate(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    });
}

export default function Dashboard({
    patrimonio_total,
    receitas_mes,
    despesas_mes,
    balanco_mes,
    contas,
    fluxo_mensal,
    despesas_categoria,
    receitas_categoria,
    transacoes_agendadas,
}: Props) {
    const [despesasOpen, setDespesasOpen] = useState(false);
    const [receitasOpen, setReceitasOpen] = useState(false);
    const [contasOpen, setContasOpen] = useState(false);

    return (
        <>
            <Head title="Dashboard" />

            <div className="page-content">
                {/* KPI cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => setContasOpen(true)}
                        role="button"
                        aria-label="Ver saldos por conta"
                    >
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Patrimônio Total
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold">
                                {formatSaldo(patrimonio_total)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => setReceitasOpen(true)}
                        role="button"
                        aria-label="Ver receitas por categoria"
                    >
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2 text-emerald-400">
                                <TrendingUp className="h-4 w-4" />
                                Receitas do Mês
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold text-emerald-400">
                                {formatSaldo(receitas_mes)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => setDespesasOpen(true)}
                        role="button"
                        aria-label="Ver despesas por categoria"
                    >
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2 text-red-400">
                                <TrendingDown className="h-4 w-4" />
                                Despesas do Mês
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold text-red-400">
                                {formatSaldo(despesas_mes)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription
                                className={`flex items-center gap-2 ${balanco_mes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                <Scale className="h-4 w-4" />
                                Balanço do Mês
                            </CardDescription>
                            <CardTitle
                                className={`text-2xl font-bold ${balanco_mes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                {formatSaldo(balanco_mes)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Fluxo Mensal + Próximas Transações */}
                <div className="grid grid-cols-12 gap-4">
                    <Card className="col-span-12 wide:col-span-8">
                        <CardHeader>
                            <CardTitle>Fluxo Mensal</CardTitle>
                            <CardDescription>
                                Receitas e despesas dos últimos 12 meses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={fluxoConfig}
                                className="h-[280px] w-full"
                            >
                                <BarChart
                                    data={fluxo_mensal}
                                    barCategoryGap="25%"
                                    barGap={2}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="mes"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v) => {
                                            const n = Number(v);
                                            if (n === 0) return '0';
                                            if (n >= 1000)
                                                return `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
                                            return n.toLocaleString('pt-BR');
                                        }}
                                        width={55}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(
                                                    value,
                                                    name,
                                                    item,
                                                ) => (
                                                    <>
                                                        <div
                                                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color,
                                                            }}
                                                        />
                                                        <div className="flex flex-1 justify-between gap-4 leading-none">
                                                            <span className="text-muted-foreground">
                                                                {fluxoConfig[
                                                                    name as string
                                                                ]?.label ??
                                                                    name}
                                                            </span>
                                                            <span className="font-mono font-medium tabular-nums">
                                                                {formatSaldo(
                                                                    Number(
                                                                        value,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="receitas"
                                        fill="var(--color-receitas)"
                                        radius={[3, 3, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="despesas"
                                        fill="var(--color-despesas)"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-12 wide:col-span-4">
                        <CardHeader>
                            <CardTitle>Próximas Transações</CardTitle>
                            <CardDescription>
                                Transações com status agendada
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transacoes_agendadas.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma transação agendada.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {transacoes_agendadas.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {t.descricao}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.categoria} ·{' '}
                                                    {formatDate(
                                                        t.data_transacao,
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 font-mono text-sm font-medium ${t.tipo === 1 ? 'text-emerald-400' : 'text-red-400'}`}
                                            >
                                                {t.tipo === 2 ? '−' : '+'}
                                                {formatSaldo(
                                                    Number(t.valor_transacao),
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SaldosContaDialog
                open={contasOpen}
                onOpenChange={setContasOpen}
                contas={contas}
            />

            <CategoriaPieChartDialog
                open={despesasOpen}
                onOpenChange={setDespesasOpen}
                title="Despesas por Categoria"
                description="Distribuição das despesas do mês atual"
                data={despesas_categoria}
                colorOffset={0}
                emptyMessage="Nenhuma despesa registrada este mês."
            />

            <CategoriaPieChartDialog
                open={receitasOpen}
                onOpenChange={setReceitasOpen}
                title="Receitas por Categoria"
                description="Distribuição das receitas do mês atual"
                data={receitas_categoria}
                colorOffset={3}
                emptyMessage="Nenhuma receita registrada este mês."
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
