import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TransacaoController from '@/actions/App/Http/Controllers/TransacaoController';
import ConfirmDialog from '@/components/confirm-dialog';
import CreateTransacaoDialog, { type TransacaoData } from '@/components/create-transacao-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Pagination, { type PaginatorLink } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    return tipo === 1 ? 'text-emerald-400' : 'text-red-400';
}

function formatValor(valor: string, tipo: number) {
    const sinal = tipo === 1 ? '+' : '-';
    return sinal + formatSaldo(valor);
}

export default function Extrato({ contas, categorias, transacoes, sort, orderBy, filters }: Props) {
    const [editingTransacao, setEditingTransacao] = useState<TransacaoData | null>(null);
    const [deletingTransacao, setDeletingTransacao] = useState<TransacaoData | null>(null);

    const lista = transacoes.data;
    const categoriasPai = categorias.filter((c) => c.categoria_pai_id === null);

    function handleDelete() {
        if (!deletingTransacao) return;
        router.delete(TransacaoController.destroy.url({ transacao: deletingTransacao.id }), {
            onSuccess: () => setDeletingTransacao(null),
        });
    }

    function handleFilter(key: string, value: string) {
        router.visit(extrato.url({ mergeQuery: { [key]: value === 'all' ? undefined : value } }));
    }

    function sortUrl(field: 'data' | 'valor') {
        const nextSort = orderBy === field ? (sort === 'desc' ? 'asc' : 'desc') : 'desc';
        return extrato.url({ mergeQuery: { order_by: field, sort: nextSort } });
    }

    function sortIcon(field: 'data' | 'valor') {
        if (orderBy !== field) return <ArrowUpDown className="size-3" />;
        return sort === 'desc' ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />;
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
                    <DropdownMenuItem variant="destructive" onClick={() => setDeletingTransacao(t)}>
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

            <div className="space-y-6 p-6">
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={filters.tipo ?? 'all'} onValueChange={(v) => handleFilter('tipo', v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="1">Receitas</SelectItem>
                            <SelectItem value="2">Despesas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.status ?? 'all'} onValueChange={(v) => handleFilter('status', v)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="2">Realizadas</SelectItem>
                            <SelectItem value="1">Agendadas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.conta_id ?? 'all'} onValueChange={(v) => handleFilter('conta_id', v)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Conta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as contas</SelectItem>
                            {contas.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.categoria_pai_id ?? 'all'} onValueChange={(v) => handleFilter('categoria_pai_id', v)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categoriasPai.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {Object.values(filters).some(Boolean) && (
                        <Link href={extrato.url()} className="text-sm text-muted-foreground hover:text-foreground">
                            Limpar filtros
                        </Link>
                    )}
                </div>

                {lista.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        Nenhuma transação encontrada.
                    </p>
                ) : (
                    <>
                        {/* Desktop: tabela */}
                        <div className="hidden rounded-md border md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            <Link
                                                href={sortUrl('data')}
                                                className="inline-flex items-center gap-1 hover:text-foreground"
                                            >
                                                Data
                                                {sortIcon('data')}
                                            </Link>
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conta</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            <Link
                                                href={sortUrl('valor')}
                                                className="inline-flex items-center justify-end gap-1 hover:text-foreground"
                                            >
                                                Valor
                                                {sortIcon('valor')}
                                            </Link>
                                        </th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((t) => {
                                        const Icone = iconesPorNome[t.categoria_icone];
                                        return (
                                            <tr key={t.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3 text-muted-foreground">{formatDate(t.data_transacao)}</td>
                                                <td className="px-4 py-3">{t.conta}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        {Icone && <Icone className="size-3.5 text-muted-foreground" />}
                                                        {t.categoria}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tipoClasses(t.tipo)}`}>
                                                        {t.tipo_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                        {t.status_label}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 text-right tabular-nums font-medium ${tipoClasses(t.tipo)}`}>
                                                    {formatValor(t.valor_transacao, t.tipo)}
                                                </td>
                                                <td className="px-4 py-3 text-center">{renderActions(t)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: cards */}
                        <div className="rounded-md border md:hidden">
                            {lista.map((t) => {
                                const Icone = iconesPorNome[t.categoria_icone];
                                return (
                                    <div key={t.id} className="border-b px-4 py-3 last:border-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tipoClasses(t.tipo)}`}>
                                                    {t.tipo_label}
                                                </span>
                                                <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                    {t.status_label}
                                                </span>
                                            </div>
                                            {renderActions(t)}
                                        </div>
                                        <p className="mt-1 text-sm font-semibold">{t.descricao}</p>
                                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                {Icone && <Icone className="size-3" />}
                                                {t.categoria}
                                            </span>
                                            <span>{t.conta}</span>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{formatDate(t.data_transacao)}</span>
                                            <span className={`tabular-nums font-semibold ${tipoClasses(t.tipo)}`}>
                                                {formatValor(t.valor_transacao, t.tipo)}
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
