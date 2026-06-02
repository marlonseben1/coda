import { Form } from '@inertiajs/react';
import { useState } from 'react';
import ContaController from '@/actions/App/Http/Controllers/ContaController';
import { decimalToDisplay, formatCurrency, toNumericValue } from '@/utils/masks/currency';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

const TIPOS = [
    { value: '1', label: 'Corrente' },
    { value: '2', label: 'Poupança' },
    { value: '3', label: 'Investimento' },
] as const;

const BANCOS = [
    { value: '1', label: 'Nubank' },
    { value: '2', label: 'Banco do Brasil' },
    { value: '3', label: 'Itaú' },
    { value: '4', label: 'Inter' },
    { value: '5', label: 'Sicredi' },
    { value: '6', label: 'Santander' },
] as const;

export interface ContaData {
    id: number;
    nome: string;
    tipo: number;
    tipo_label: string;
    banco: number;
    banco_label: string;
    saldo_inicial: string;
    saldo_atual: string;
}

interface Props {
    conta?: ContaData;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}


export default function CreateContaDialog({ conta, open: controlledOpen, onOpenChange }: Props) {
    const isEditMode = !!conta;
    const [internalOpen, setInternalOpen] = useState(false);
    const [saldo, setSaldo] = useState(() => (conta ? decimalToDisplay(conta.saldo_inicial) : ''));

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    function handleSaldoChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSaldo(formatCurrency(e.target.value));
    }

    function handleSuccess() {
        setOpen(false);
        setSaldo('');
    }

    const formProps = isEditMode
        ? ContaController.update.form({ conta: conta.id })
        : ContaController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEditMode && (
                <DialogTrigger asChild>
                    <Button>Nova Conta</Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
                </DialogHeader>

                <Form
                    {...formProps}
                    resetOnSuccess
                    onSuccess={handleSuccess}
                    className="space-y-4"
                    noValidate
                >
                    {({ processing, errors }) => (
                        <>
                            <div className={isEditMode ? 'grid gap-2' : 'grid grid-cols-12 gap-4'}>
                                <div className={isEditMode ? '' : 'col-span-12 grid gap-2 sm:col-span-8'}>
                                    <Label htmlFor="nome">Nome</Label>
                                    <Input
                                        id="nome"
                                        name="nome"
                                        placeholder="Ex: Conta Nubank"
                                        defaultValue={conta?.nome}
                                        maxLength={30}
                                        autoFocus
                                        aria-invalid={!!errors.nome}
                                    />
                                    <InputError message={errors.nome} />
                                </div>

                                {!isEditMode && (
                                    <div className="col-span-12 grid gap-2 sm:col-span-4">
                                        <Label htmlFor="saldo_inicial">Saldo Inicial</Label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground select-none">
                                                R$
                                            </span>
                                            <input
                                                type="hidden"
                                                name="saldo_inicial"
                                                value={toNumericValue(saldo)}
                                            />
                                            <Input
                                                id="saldo_inicial"
                                                inputMode="numeric"
                                                placeholder="0,00"
                                                value={saldo}
                                                onChange={handleSaldoChange}
                                                className="pl-9"
                                                aria-invalid={!!errors.saldo_inicial}
                                            />
                                        </div>
                                        <InputError message={errors.saldo_inicial} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select name="tipo" defaultValue={conta ? String(conta.tipo) : undefined}>
                                        <SelectTrigger id="tipo" className="w-full" aria-invalid={!!errors.tipo}>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIPOS.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.tipo} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banco">Banco</Label>
                                    <Select name="banco" defaultValue={conta ? String(conta.banco) : undefined}>
                                        <SelectTrigger id="banco" className="w-full" aria-invalid={!!errors.banco}>
                                            <SelectValue placeholder="Selecione o banco" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BANCOS.map((b) => (
                                                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.banco} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {isEditMode ? 'Salvar alterações' : 'Criar conta'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
