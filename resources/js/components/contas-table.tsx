import { router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatSaldo } from '@/utils/currency/currency';
import ContaController from '@/actions/App/Http/Controllers/ContaController';
import CreateContaDialog, { type ContaData } from '@/components/create-conta-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    contas: ContaData[];
}


export default function ContasTable({ contas }: Props) {
    const [editingConta, setEditingConta] = useState<ContaData | null>(null);

    function handleDelete(conta: ContaData) {
        router.delete(ContaController.destroy.url({ conta: conta.id }));
    }

    if (contas.length === 0) {
        return (
            <p className="empty-state">
                Nenhuma conta cadastrada. Crie sua primeira conta!
            </p>
        );
    }

    function renderActions(conta: ContaData) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ações</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingConta(conta)}>
                        <Pencil />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        disabled={parseFloat(conta.saldo_atual) !== 0}
                        onClick={() => handleDelete(conta)}
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
            {/* Desktop: tabela */}
            <div className="hidden rounded-md border md:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="data-table-header-cell">Nome da conta</th>
                            <th className="data-table-header-cell">Tipo</th>
                            <th className="data-table-header-cell">Banco</th>
                            <th className="data-table-header-cell text-right">Saldo</th>
                            <th className="data-table-header-cell text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contas.map((conta) => (
                            <tr key={conta.id} className="data-table-row">
                                <td className="data-table-cell font-medium">{conta.nome}</td>
                                <td className="data-table-cell text-muted-foreground">{conta.tipo_label}</td>
                                <td className="data-table-cell text-muted-foreground">{conta.banco_label}</td>
                                <td className="data-table-cell text-right tabular-nums">{formatSaldo(conta.saldo_atual)}</td>
                                <td className="data-table-cell text-center">{renderActions(conta)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile: cards */}
            <div className="rounded-md border md:hidden">
                {contas.map((conta) => (
                    <div key={conta.id} className="card-list-item">
                        <div className="flex items-center justify-between">
                            <span className="badge-pill text-muted-foreground">
                                {conta.tipo_label}
                            </span>
                            {renderActions(conta)}
                        </div>
                        <p className="mt-1 text-sm font-semibold">{conta.nome}</p>
                        <div className="mt-0.5 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{conta.banco_label}</span>
                            <span className="font-semibold tabular-nums">{formatSaldo(conta.saldo_atual)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {editingConta && (
                <CreateContaDialog
                    conta={editingConta}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingConta(null);
                    }}
                />
            )}
        </>
    );
}
