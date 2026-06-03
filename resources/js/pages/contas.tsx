import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { type ContaData } from '@/components/create-conta-dialog';
import ContasTable from '@/components/contas-table';
import CreateContaDialog from '@/components/create-conta-dialog';
import CreateTransferenciaDialog from '@/components/create-transferencia-dialog';
import { Button } from '@/components/ui/button';
import Pagination, { type PaginatorLink } from '@/components/ui/pagination';
import { contas, transferencias } from '@/routes';

interface Paginated<T> {
    data: T[];
    links: PaginatorLink[];
}

interface Props {
    contas: Paginated<ContaData>;
    contasSelect: ContaData[];
}

export default function Contas({ contas: paginatedContas, contasSelect }: Props) {
    const [transferenciaOpen, setTransferenciaOpen] = useState(false);

    return (
        <>
            <Head title="Contas" />

            <div className="page-content">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" className="hidden sm:inline-flex" asChild>
                        <Link href={transferencias()}>Histórico de transferências</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setTransferenciaOpen(true)}>
                        Nova Transferência
                    </Button>
                    <CreateContaDialog />
                </div>

                <ContasTable contas={paginatedContas.data} />
                <Pagination links={paginatedContas.links} />
            </div>

            <CreateTransferenciaDialog
                contas={contasSelect}
                open={transferenciaOpen}
                onOpenChange={setTransferenciaOpen}
            />
        </>
    );
}

Contas.layout = {
    breadcrumbs: [{ title: 'Contas', href: contas() }],
};
