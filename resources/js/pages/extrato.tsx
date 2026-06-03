import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import TransacaoController from '@/actions/App/Http/Controllers/TransacaoController';
import ConfirmDialog from '@/components/confirm-dialog';
import CreateTransacaoDialog, {
    type TransacaoData,
} from '@/components/create-transacao-dialog';
import FilterDialog from '@/components/filter-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Pagination, { type PaginatorLink } from '@/components/ui/pagination';
import { formatSaldo } from '@/utils/currency/currency';
import { formatDate } from '@/utils/date/date';
import { iconesPorNome } from '@/utils/icones-categorias';
import { extrato } from '@/routes';

interface ContaOption {
    id: number;
    nome: string;
    saldo_atual: string;
}

interface CategoriaOption {
    id: number;
    nome: string;
    tipo: number;
    categoria_pai_id: number | null;
}

interface Paginated<T> {
    data: T[];
    links: PaginatorLink[];
    total: number;
}

interface Filters {
    [key: string]: string | undefined;
    tipo?: string;
    conta_id?: string;
    status?: string;
    categoria_pai_id?: string;
    data_inicio?: string;
    data_fim?: string;
}

interface Props {
    contas: ContaOption[];
    categorias: CategoriaOption[];
    transacoes: Paginated<TransacaoData>;
    sort: 'asc' | 'desc';
    orderBy: 'data' | 'valor';
    filters: Filters;
}

function tipoClasses(tipo: number) {
    return tipo === 1 ? 'text-receita' : 'text-despesa';
}

function formatValor(valor: string, tipo: number) {
    const sinal = tipo === 1 ? '+' : '-';
    return sinal + formatSaldo(valor);
}

export default function Extrato({
    contas,
    categorias,
    transacoes,
    sort,
    orderBy,
    filters,
}: Props) {
    const [editingTransacao, setEditingTransacao] =
        useState<TransacaoData | null>(null);
    const [deletingTransacao, setDeletingTransacao] =
        useState<TransacaoData | null>(null);

    const lista = transacoes.data;
    const categoriasPai = categorias.filter((c) => c.categoria_pai_id === null);

    function handleDelete() {
        if (!deletingTransacao) return;
        router.delete(
            TransacaoController.destroy.url({
                transacao: deletingTransacao.id,
            }),
            {
                onSuccess: () => setDeletingTransacao(null),
            },
        );
    }

    function sortUrl(field: 'data' | 'valor') {
        const nextSort =
            orderBy === field ? (sort === 'desc' ? 'asc' : 'desc') : 'desc';
        return extrato.url({ mergeQuery: { order_by: field, sort: nextSort } });
    }

    function sortIcon(field: 'data' | 'valor') {
        if (orderBy !== field) return <ArrowUpDown className="size-3" />;
        return sort === 'desc' ? (
            <ArrowDown className="size-3" />
        ) : (
            <ArrowUp className="size-3" />
        );
    }

    function renderActions(t: TransacaoData) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ações</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingTransacao(t)}>
                        <Pencil />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingTransacao(t)}
                    >
                        <Trash2 />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <>
            <Head title="Extrato" />

            <div className="page-content">
                {/* Filtros */}
                <FilterDialog
                    filters={filters}
                    fields={[
                        {
                            key: 'tipo',
                            label: 'Tipo',
                            options: [
                                { value: '1', label: 'Receitas' },
                                { value: '2', label: 'Despesas' },
                            ],
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { value: '2', label: 'Realizadas' },
                                { value: '1', label: 'Agendadas' },
                            ],
                        },
                        {
                            key: 'conta_id',
                            label: 'Conta',
                            allLabel: 'Todas as contas',
                            options: contas.map((c) => ({
                                value: String(c.id),
                                label: c.nome,
                            })),
                        },
                        {
                            key: 'categoria_pai_id',
                            label: 'Categoria',
                            allLabel: 'Todas as categorias',
                            options: categoriasPai.map((c) => ({
                                value: String(c.id),
                                label: c.nome,
                            })),
                        },
                    ]}
                    onApply={(newFilters) =>
                        router.visit(extrato.url({ mergeQuery: newFilters }))
                    }
                    onClear={() => router.visit(extrato.url())}
                />

                {lista.length === 0 ? (
                    <p className="empty-state">Nenhuma transação encontrada.</p>
                ) : (
                    <>
                        {/* Desktop: tabela */}
                        <div className="hidden rounded-md border min-[1080px]:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="data-table-header-cell">
                                            <Link
                                                href={sortUrl('data')}
                                                className="inline-flex items-center gap-1 hover:text-foreground"
                                            >
                                                Data
                                                {sortIcon('data')}
                                            </Link>
                                        </th>
                                        <th className="data-table-header-cell">
                                            Conta
                                        </th>
                                        <th className="data-table-header-cell">
                                            Categoria
                                        </th>
                                        <th className="data-table-header-cell">
                                            Tipo
                                        </th>
                                        <th className="data-table-header-cell">
                                            Status
                                        </th>
                                        <th className="data-table-header-cell text-right">
                                            <Link
                                                href={sortUrl('valor')}
                                                className="inline-flex items-center justify-end gap-1 hover:text-foreground"
                                            >
                                                Valor
                                                {sortIcon('valor')}
                                            </Link>
                                        </th>
                                        <th className="data-table-header-cell text-center">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((t) => {
                                        const Icone =
                                            iconesPorNome[t.categoria_icone];
                                        return (
                                            <tr
                                                key={t.id}
                                                className="data-table-row"
                                            >
                                                <td className="data-table-cell text-muted-foreground">
                                                    {formatDate(
                                                        t.data_transacao,
                                                    )}
                                                </td>
                                                <td className="data-table-cell">
                                                    {t.conta}
                                                </td>
                                                <td className="data-table-cell">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        {Icone && (
                                                            <Icone className="size-3.5 text-muted-foreground" />
                                                        )}
                                                        {t.categoria}
                                                    </span>
                                                </td>
                                                <td className="data-table-cell">
                                                    <span
                                                        className={`badge-pill font-medium ${tipoClasses(t.tipo)}`}
                                                    >
                                                        {t.tipo_label}
                                                    </span>
                                                </td>
                                                <td className="data-table-cell">
                                                    <span className="badge-pill text-muted-foreground">
                                                        {t.status_label}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`data-table-cell text-right font-medium tabular-nums ${tipoClasses(t.tipo)}`}
                                                >
                                                    {formatValor(
                                                        t.valor_transacao,
                                                        t.tipo,
                                                    )}
                                                </td>
                                                <td className="data-table-cell text-center">
                                                    {renderActions(t)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: cards */}
                        <div className="rounded-md border min-[1080px]:hidden">
                            {lista.map((t) => {
                                const Icone = iconesPorNome[t.categoria_icone];
                                return (
                                    <div key={t.id} className="card-list-item">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`badge-pill font-medium ${tipoClasses(t.tipo)}`}
                                                >
                                                    {t.tipo_label}
                                                </span>
                                                <span className="badge-pill text-muted-foreground">
                                                    {t.status_label}
                                                </span>
                                            </div>
                                            {renderActions(t)}
                                        </div>
                                        <p className="mt-1 text-sm font-semibold">
                                            {t.descricao}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                {Icone && (
                                                    <Icone className="size-3" />
                                                )}
                                                {t.categoria}
                                            </span>
                                            <span>{t.conta}</span>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {formatDate(t.data_transacao)}
                                            </span>
                                            <span
                                                className={`font-semibold tabular-nums ${tipoClasses(t.tipo)}`}
                                            >
                                                {formatValor(
                                                    t.valor_transacao,
                                                    t.tipo,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination links={transacoes.links} />
                    </>
                )}
            </div>

            {editingTransacao && (
                <CreateTransacaoDialog
                    contas={contas}
                    categorias={categorias}
                    transacao={editingTransacao}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingTransacao(null);
                    }}
                />
            )}

            <ConfirmDialog
                open={!!deletingTransacao}
                onOpenChange={(open) => {
                    if (!open) setDeletingTransacao(null);
                }}
                title="Excluir transação"
                description={
                    deletingTransacao
                        ? `Tem certeza que deseja excluir "${deletingTransacao.descricao}"? Esta ação não pode ser desfeita.`
                        : ''
                }
                confirmLabel="Excluir"
                onConfirm={handleDelete}
            />
        </>
    );
}

Extrato.layout = {
    breadcrumbs: [{ title: 'Extrato', href: extrato() }],
};
