import { Form } from '@inertiajs/react';
import { useState } from 'react';
import TransacaoController from '@/actions/App/Http/Controllers/TransacaoController';
import { decimalToDisplay, formatCurrency, toNumericValue } from '@/utils/masks/currency';
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

const TIPOS = [
    { value: '1', label: 'Receita' },
    { value: '2', label: 'Despesa' },
] as const;

const STATUS = [
    { value: '2', label: 'Realizada' },
    { value: '1', label: 'Agendada' },
] as const;

export interface TransacaoData {
    id: number;
    conta: string;
    conta_id: number;
    categoria: string;
    categoria_id: number;
    categoria_icone: string;
    tipo: number;
    tipo_label: string;
    descricao: string;
    data_transacao: string;
    valor_transacao: string;
    status: number;
    status_label: string;
}

interface ContaOption {
    id: number;
    nome: string;
}

interface CategoriaOption {
    id: number;
    nome: string;
    tipo: number;
}

function LockedField({ label, value }: { label: string; value: string }) {
    return (
        <>
            <Label>{label}</Label>
            <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                {value}
            </div>
        </>
    );
}

interface Props {
    contas: ContaOption[];
    categorias: CategoriaOption[];
    transacao?: TransacaoData;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    tipoInicial?: number;
    tipoFixo?: number;
}

export default function CreateTransacaoDialog({
    contas,
    categorias,
    transacao,
    open: controlledOpen,
    onOpenChange,
    tipoInicial,
    tipoFixo,
}: Props) {
    const isEditMode = !!transacao;
    const [internalOpen, setInternalOpen] = useState(false);
    const [valor, setValor] = useState(() => (transacao ? decimalToDisplay(transacao.valor_transacao) : ''));
    const [tipoSelecionado, setTipoSelecionado] = useState<string>(() => {
        if (transacao) return String(transacao.tipo);
        if (tipoFixo) return String(tipoFixo);
        if (tipoInicial) return String(tipoInicial);
        return '2';
    });

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValor(formatCurrency(e.target.value));
    }

    function handleSuccess() {
        setOpen(false);
        setValor('');
        setTipoSelecionado(tipoInicial ? String(tipoInicial) : '2');
    }

    const categoriasFiltradas = categorias.filter((c) => c.tipo === parseInt(tipoSelecionado));

    const formProps = isEditMode
        ? TransacaoController.update.form({ transacao: transacao.id })
        : TransacaoController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode
                            ? 'Editar Transação'
                            : tipoFixo === 1
                              ? 'Nova Receita'
                              : tipoFixo === 2
                                ? 'Nova Despesa'
                                : 'Nova Transação'}
                    </DialogTitle>
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
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="conta_id">Conta</Label>
                                    <Select
                                        name="conta_id"
                                        defaultValue={transacao ? String(transacao.conta_id) : undefined}
                                    >
                                        <SelectTrigger id="conta_id" className="w-full" aria-invalid={!!errors.conta_id}>
                                            <SelectValue placeholder="Selecione a conta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contas.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.conta_id} />
                                </div>

                                <div className="grid gap-2">
                                    {tipoFixo || isEditMode ? (
                                        <>
                                            <input type="hidden" name="tipo" value={tipoSelecionado} />
                                            <LockedField
                                                label="Tipo"
                                                value={TIPOS.find((t) => t.value === tipoSelecionado)?.label ?? ''}
                                            />
                                            <InputError message={errors.tipo} />
                                        </>
                                    ) : (
                                        <>
                                            <Label htmlFor="tipo">Tipo</Label>
                                            <Select
                                                name="tipo"
                                                value={tipoSelecionado}
                                                onValueChange={setTipoSelecionado}
                                            >
                                                <SelectTrigger id="tipo" className="w-full" aria-invalid={!!errors.tipo}>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIPOS.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.tipo} />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="categoria_id">Categoria</Label>
                                <Select
                                    name="categoria_id"
                                    defaultValue={transacao ? String(transacao.categoria_id) : undefined}
                                    key={tipoSelecionado}
                                >
                                    <SelectTrigger id="categoria_id" className="w-full" aria-invalid={!!errors.categoria_id}>
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriasFiltradas.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.categoria_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Input
                                    id="descricao"
                                    name="descricao"
                                    placeholder="Ex: Supermercado"
                                    defaultValue={transacao?.descricao}
                                    aria-invalid={!!errors.descricao}
                                />
                                <InputError message={errors.descricao} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="data_transacao">Data</Label>
                                    <Input
                                        id="data_transacao"
                                        name="data_transacao"
                                        type="date"
                                        defaultValue={transacao?.data_transacao ?? todayDate()}
                                        aria-invalid={!!errors.data_transacao}
                                    />
                                    <InputError message={errors.data_transacao} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="valor_transacao">Valor</Label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground select-none">
                                            R$
                                        </span>
                                        <input type="hidden" name="valor_transacao" value={toNumericValue(valor)} />
                                        <Input
                                            id="valor_transacao"
                                            inputMode="numeric"
                                            placeholder="0,00"
                                            value={valor}
                                            onChange={handleValorChange}
                                            className="pl-9"
                                            aria-invalid={!!errors.valor_transacao}
                                        />
                                    </div>
                                    <InputError message={errors.valor_transacao} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    name="status"
                                    defaultValue={transacao ? String(transacao.status) : '2'}
                                >
                                    <SelectTrigger id="status" className="w-full" aria-invalid={!!errors.status}>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {isEditMode ? 'Salvar alterações' : 'Criar transação'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
