import { Form } from '@inertiajs/react';
import { Minus, MoveRight } from 'lucide-react';
import { useState } from 'react';
import TransferenciaController from '@/actions/App/Http/Controllers/TransferenciaController';
import { type ContaData } from '@/components/create-conta-dialog';
import { formatCurrency, toNumericValue } from '@/utils/masks/currency';
import { todayDate } from '@/utils/date/date';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Props {
    contas: ContaData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}


export default function CreateTransferenciaDialog({ contas, open, onOpenChange }: Props) {
    const [valor, setValor] = useState('');
    const [fromAccountId, setFromAccountId] = useState('');

    function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValor(formatCurrency(e.target.value));
    }

    function handleSuccess() {
        onOpenChange(false);
        setValor('');
        setFromAccountId('');
    }

    const contasDestino = contas.filter((c) => String(c.id) !== fromAccountId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Transferência</DialogTitle>
                </DialogHeader>

                <Form
                    {...TransferenciaController.store.form()}
                    resetOnSuccess
                    onSuccess={handleSuccess}
                    className="space-y-4"
                    noValidate
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex items-end gap-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="from_account_id">Conta origem</Label>
                                    <Select
                                        name="from_account_id"
                                        value={fromAccountId}
                                        onValueChange={setFromAccountId}
                                    >
                                        <SelectTrigger id="from_account_id" className="w-full" aria-invalid={!!errors.from_account_id}>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contas.map((conta) => (
                                                <SelectItem key={conta.id} value={String(conta.id)}>
                                                    {conta.nome} · {conta.banco_label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.from_account_id} />
                                </div>

                                <MoveRight className="mb-2 size-4 shrink-0 text-muted-foreground" />

                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="to_account_id">Conta destino</Label>
                                    <Select name="to_account_id">
                                        <SelectTrigger id="to_account_id" className="w-full" aria-invalid={!!errors.to_account_id}>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contasDestino.map((conta) => (
                                                <SelectItem key={conta.id} value={String(conta.id)}>
                                                    {conta.nome} · {conta.banco_label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.to_account_id} />
                                </div>
                            </div>

                            <div className="flex items-end gap-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="data_transferencia">Data</Label>
                                    <Input
                                        id="data_transferencia"
                                        name="data_transferencia"
                                        type="date"
                                        defaultValue={todayDate()}
                                        aria-invalid={!!errors.data_transferencia}
                                    />
                                    <InputError message={errors.data_transferencia} />
                                </div>

                                <Minus className="mb-2 size-4 shrink-0 text-muted-foreground" />

                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="valor_transferencia">Valor</Label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground select-none">
                                            R$
                                        </span>
                                        <input type="hidden" name="valor_transferencia" value={toNumericValue(valor)} />
                                        <Input
                                            id="valor_transferencia"
                                            inputMode="numeric"
                                            placeholder="0,00"
                                            value={valor}
                                            onChange={handleValorChange}
                                            className="pl-9"
                                            aria-invalid={!!errors.valor_transferencia}
                                        />
                                    </div>
                                    <InputError message={errors.valor_transferencia} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Transferir
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
