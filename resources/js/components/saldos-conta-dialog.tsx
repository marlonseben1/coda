import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatSaldo } from '@/utils/currency/currency';

export interface ContaItem {
    id: number;
    nome: string;
    tipo_label: string;
    banco_label: string;
    saldo_atual: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contas: ContaItem[];
}

export function SaldosContaDialog({ open, onOpenChange, contas }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Saldos por Conta</DialogTitle>
                    <DialogDescription>Saldo atual de cada conta ativa</DialogDescription>
                </DialogHeader>

                {contas.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
                ) : (
                    <div className="space-y-4">
                        {contas.map((conta) => (
                            <div key={conta.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{conta.nome}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {conta.banco_label} · {conta.tipo_label}
                                    </p>
                                </div>
                                <span className="font-mono text-sm font-medium">
                                    {formatSaldo(conta.saldo_atual)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
