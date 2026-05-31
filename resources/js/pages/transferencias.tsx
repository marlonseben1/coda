import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { type ContaData } from '@/components/create-conta-dialog';
import CreateContaDialog from '@/components/create-conta-dialog';
import CreateTransferenciaDialog from '@/components/create-transferencia-dialog';
import { Button } from '@/components/ui/button';
import Pagination, { type PaginatorLink } from '@/components/ui/pagination';
import { formatSaldo } from '@/utils/currency/currency';
import { formatDate } from '@/utils/date/date';
import { contas, transferencias } from '@/routes';

interface TransferenciaData {
    id: number;
    from_account: string;
    to_account: string;
    valor_transferencia: string;
    data_transferencia: string;
}

interface Paginated<T> {
    data: T[];
    links: PaginatorLink[];
}

interface Props {
    contas: ContaData[];
    transferencias: Paginated<TransferenciaData>;
    sort: 'asc' | 'desc';
    orderBy: 'data' | 'valor';
}

export default function Transferencias({ contas: listContas, transferencias: paginatedTransferencias, sort, orderBy }: Props) {
    const [transferenciaOpen, setTransferenciaOpen] = useState(false);
    const lista = paginatedTransferencias.data;

    return (
        <>
            <Head title="Histórico de Transferências" />

            <div className="space-y-6 p-6">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href={contas()}>Contas</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setTransferenciaOpen(true)}>
                        Nova Transferência
                    </Button>
                    <CreateContaDialog />
                </div>

                {lista.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        Nenhuma transferência realizada ainda.
                    </p>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            <Link
                                                href={transferencias.url({ query: { order_by: 'data', sort: orderBy === 'data' ? (sort === 'desc' ? 'asc' : 'desc') : 'desc' } })}
                                                className="inline-flex items-center gap-1 hover:text-foreground"
                                            >
                                                Data
                                                {orderBy === 'data' ? (sort === 'desc' ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ArrowUpDown className="size-3" />}
                                            </Link>
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conta origem</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conta destino</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            <Link
                                                href={transferencias.url({ query: { order_by: 'valor', sort: orderBy === 'valor' ? (sort === 'desc' ? 'asc' : 'desc') : 'desc' } })}
                                                className="inline-flex items-center justify-end gap-1 hover:text-foreground"
                                            >
                                                Valor
                                                {orderBy === 'valor' ? (sort === 'desc' ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ArrowUpDown className="size-3" />}
                                            </Link>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((t) => (
                                        <tr key={t.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(t.data_transferencia)}</td>
                                            <td className="px-4 py-3">{t.from_account}</td>
                                            <td className="px-4 py-3">{t.to_account}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatSaldo(t.valor_transferencia)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={paginatedTransferencias.links} />
                    </>
                )}
            </div>

            <CreateTransferenciaDialog
                contas={listContas}
                open={transferenciaOpen}
                onOpenChange={setTransferenciaOpen}
            />
        </>
    );
}

Transferencias.layout = {
    breadcrumbs: [
        { title: 'Contas', href: contas() },
        { title: 'Histórico de Transferências', href: transferencias() },
    ],
};
