import { Form } from '@inertiajs/react';
import { Smile } from 'lucide-react';
import { useState } from 'react';
import CategoriaController from '@/actions/App/Http/Controllers/CategoriaController';
import { ICONES_CATEGORIAS, iconesPorNome } from '@/utils/icones-categorias';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
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
    { value: '1', label: 'Receita' },
    { value: '2', label: 'Despesa' },
] as const;

export interface CategoriaData {
    id: number;
    nome: string;
    icone: string | null;
    tipo: number;
    tipo_label: string;
    categoria_pai_id: number | null;
    categoria_pai_nome: string | null;
}

interface Props {
    categorias: CategoriaData[];
    categoria?: CategoriaData;
    categoriaPaiFixa?: CategoriaData;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
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

function IconePicker({
    value,
    onChange,
    obrigatorio,
    error,
}: {
    value: string;
    onChange: (name: string) => void;
    obrigatorio: boolean;
    error?: string;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const IconeSelecionado = value ? iconesPorNome[value] : null;

    return (
        <>
            <input type="hidden" name="icone" value={value} />
            <Label>
                Ícone{obrigatorio && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start gap-2"
                            aria-invalid={!!error}
                        >
                            {IconeSelecionado ? (
                                <IconeSelecionado className="size-4 shrink-0" />
                            ) : (
                                <Smile className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className={IconeSelecionado ? '' : 'text-muted-foreground'}>
                                {IconeSelecionado
                                    ? (ICONES_CATEGORIAS.find((i) => i.name === value)?.label ?? value)
                                    : 'Selecionar ícone'}
                            </span>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="content-start">
                        <DialogHeader>
                            <DialogTitle>Escolha um ícone</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-5 gap-2 py-2">
                            {ICONES_CATEGORIAS.map(({ name, label, icon: Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    title={label}
                                    onClick={() => {
                                        onChange(value === name ? '' : name);
                                        setPickerOpen(false);
                                    }}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-[10px] transition-colors hover:bg-muted ${
                                        value === name
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-transparent text-muted-foreground'
                                    }`}
                                >
                                    <Icon className="size-5 shrink-0" />
                                    <span className="w-full text-center leading-tight break-words">{label}</span>
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
                <InputError message={error} />
        </>
    );
}

export default function CreateCategoriaDialog({
    categorias,
    categoria,
    categoriaPaiFixa,
    open: controlledOpen,
    onOpenChange,
}: Props) {
    const isEditMode = !!categoria;
    const isSubcategoriaMode = !!categoriaPaiFixa;

    const [internalOpen, setInternalOpen] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState<string>(
        categoria ? String(categoria.tipo) : categoriaPaiFixa ? String(categoriaPaiFixa.tipo) : '',
    );
    const [iconeSelecionado, setIconeSelecionado] = useState<string>(
        categoria?.icone ?? categoriaPaiFixa?.icone ?? '',
    );
    const [categoriaPaiSelecionada, setCategoriaPaiSelecionada] = useState<string>(
        categoria?.categoria_pai_id
            ? String(categoria.categoria_pai_id)
            : categoriaPaiFixa
              ? String(categoriaPaiFixa.id)
              : '',
    );

    const isFilho = categoriaPaiSelecionada !== '';
    const iconeObrigatorio = !isFilho;

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    function handleSuccess() {
        setOpen(false);
        if (!isEditMode) {
            if (!isSubcategoriaMode) {
                setTipoSelecionado('');
                setCategoriaPaiSelecionada('');
            }
            setIconeSelecionado('');
        }
    }

    const categoriasPai = categorias.filter(
        (c) => c.categoria_pai_id === null && (!isEditMode || c.id !== categoria!.id),
    );

    const formProps = isEditMode
        ? CategoriaController.update.form({ categoria: categoria!.id })
        : CategoriaController.store.form();

    const title = isSubcategoriaMode ? 'Nova Subcategoria' : isEditMode ? 'Editar Categoria' : 'Nova Categoria';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isEditMode && !isSubcategoriaMode && (
                <DialogTrigger asChild>
                    <Button>Nova Categoria</Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <Form {...formProps} resetOnSuccess onSuccess={handleSuccess} className="space-y-4" noValidate>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    name="nome"
                                    placeholder="Ex: Alimentação"
                                    defaultValue={categoria?.nome}
                                    maxLength={30}
                                    autoFocus
                                    aria-invalid={!!errors.nome}
                                />
                                <InputError message={errors.nome} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <IconePicker
                                        value={iconeSelecionado}
                                        onChange={setIconeSelecionado}
                                        obrigatorio={iconeObrigatorio}
                                        error={errors.icone}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <input type="hidden" name="tipo" value={tipoSelecionado} />
                                    {isSubcategoriaMode ? (
                                        <LockedField label="Tipo" value={categoriaPaiFixa.tipo_label} />
                                    ) : (
                                        <>
                                            <Label htmlFor="tipo">Tipo</Label>
                                            <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
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
                                <input type="hidden" name="categoria_pai_id" value={categoriaPaiSelecionada} />
                                {isSubcategoriaMode ? (
                                    <>
                                        <LockedField label="Categoria pai" value={categoriaPaiFixa.nome} />
                                        <InputError message={errors.categoria_pai_id} />
                                    </>
                                ) : (
                                    <>
                                        <Label htmlFor="categoria_pai_id">Categoria pai</Label>
                                        <Select value={categoriaPaiSelecionada} onValueChange={setCategoriaPaiSelecionada}>
                                            <SelectTrigger id="categoria_pai_id" className="w-full" aria-invalid={!!errors.categoria_pai_id}>
                                                <SelectValue placeholder="Nenhuma (raiz)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoriasPai
                                                    .filter((c) => !tipoSelecionado || c.tipo === Number(tipoSelecionado))
                                                    .map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.nome}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.categoria_pai_id} />
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {isEditMode ? 'Salvar alterações' : isSubcategoriaMode ? 'Criar subcategoria' : 'Criar categoria'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
