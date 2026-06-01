import { router } from '@inertiajs/react';
import {
    Box,
    ChevronDown,
    FolderPlus,
    MoreHorizontal,
    PackageOpen,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import CategoriaController from '@/actions/App/Http/Controllers/CategoriaController';
import ConfirmDialog from '@/components/confirm-dialog';
import CreateCategoriaDialog, {
    type CategoriaData,
} from '@/components/create-categoria-dialog';
import { iconesPorNome } from '@/utils/icones-categorias';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    categorias: CategoriaData[];
}

function CategoriaActions({
    categoria,
    categorias,
    onEdit,
}: {
    categoria: CategoriaData;
    categorias: CategoriaData[];
    onEdit: (c: CategoriaData) => void;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [subDialogOpen, setSubDialogOpen] = useState(false);
    const isPai = categoria.categoria_pai_id === null;
    const limiteSubcategoriasAtingido =
        isPai && categorias.filter((c) => c.categoria_pai_id === categoria.id).length >= 5;

    function handleConfirmDelete() {
        router.delete(
            CategoriaController.destroy.url({ categoria: categoria.id }),
        );
        setConfirmOpen(false);
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                    >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ações</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isPai && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setSubDialogOpen(true)}
                                disabled={limiteSubcategoriasAtingido}
                            >
                                <FolderPlus />
                                Nova subcategoria
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(categoria)}>
                        <Pencil />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirmOpen(true)}
                    >
                        <Trash2 />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Excluir categoria"
                description={
                    <>
                        Tem certeza que deseja excluir{' '}
                        <strong>{categoria.nome}</strong>? Esta ação não pode
                        ser desfeita.
                    </>
                }
                onConfirm={handleConfirmDelete}
                confirmLabel="Excluir"
            />

            {isPai && (
                <CreateCategoriaDialog
                    categorias={categorias}
                    categoriaPaiFixa={categoria}
                    open={subDialogOpen}
                    onOpenChange={setSubDialogOpen}
                />
            )}
        </>
    );
}

function CategoriaPaiItem({
    pai,
    subcategorias,
    todasCategorias,
    onEdit,
}: {
    pai: CategoriaData;
    subcategorias: CategoriaData[];
    todasCategorias: CategoriaData[];
    onEdit: (c: CategoriaData) => void;
}) {
    const [open, setOpen] = useState(false);
    const IconePai = pai.icone ? iconesPorNome[pai.icone] : null;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="flex items-center gap-2 border-b px-4 py-3 last:border-0 hover:bg-muted/30">
                <CollapsibleTrigger asChild>
                    <button className="flex flex-1 cursor-pointer items-center gap-2 text-left text-sm font-medium">
                        <ChevronDown
                            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                        {IconePai && (
                            <IconePai className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        {pai.nome}
                        {subcategorias.length > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                                ({subcategorias.length})
                            </span>
                        )}
                    </button>
                </CollapsibleTrigger>
                <CategoriaActions
                    categoria={pai}
                    categorias={todasCategorias}
                    onEdit={onEdit}
                />
            </div>

            <CollapsibleContent>
                {subcategorias.length === 0 ? (
                    <p className="border-b px-10 py-2 text-xs text-muted-foreground last:border-0">
                        Nenhuma subcategoria cadastrada.
                    </p>
                ) : (
                    subcategorias.map((sub) => {
                        const iconeKey = sub.icone ?? pai.icone;
                        const IconeSub = iconeKey
                            ? iconesPorNome[iconeKey]
                            : null;
                        return (
                            <div
                                key={sub.id}
                                className="flex items-center justify-between border-b bg-muted/20 px-4 py-2.5 pl-10 last:border-0"
                            >
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {IconeSub && (
                                        <IconeSub className="size-4 shrink-0" />
                                    )}
                                    {sub.nome}
                                </span>
                                <CategoriaActions
                                    categoria={sub}
                                    categorias={todasCategorias}
                                    onEdit={onEdit}
                                />
                            </div>
                        );
                    })
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

function TipoAccordion({
    titulo,
    categoriasPai,
    todasCategorias,
    onEdit,
}: {
    titulo: string;
    categoriasPai: CategoriaData[];
    todasCategorias: CategoriaData[];
    onEdit: (c: CategoriaData) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="rounded-t-md border-b bg-muted/50 px-4 py-3">
                <CollapsibleTrigger asChild>
                    <button className="flex w-full cursor-pointer items-center gap-2 text-left text-sm font-semibold">
                        {open ? (
                            <PackageOpen className="size-4 shrink-0" />
                        ) : (
                            <Box className="size-4 shrink-0" />
                        )}
                        {titulo}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({categoriasPai.length})
                        </span>
                    </button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                {categoriasPai.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma categoria cadastrada.
                    </p>
                ) : (
                    categoriasPai.map((pai) => {
                        const subcategorias = todasCategorias.filter(
                            (c) => c.categoria_pai_id === pai.id,
                        );
                        return (
                            <CategoriaPaiItem
                                key={pai.id}
                                pai={pai}
                                subcategorias={subcategorias}
                                todasCategorias={todasCategorias}
                                onEdit={onEdit}
                            />
                        );
                    })
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

export default function CategoriasAccordion({ categorias }: Props) {
    const [editingCategoria, setEditingCategoria] =
        useState<CategoriaData | null>(null);

    const receitas = categorias.filter(
        (c) => c.tipo === 1 && c.categoria_pai_id === null,
    );
    const despesas = categorias.filter(
        (c) => c.tipo === 2 && c.categoria_pai_id === null,
    );

    return (
        <>
            <div className="space-y-4">
                <div className="overflow-hidden rounded-md border">
                    <TipoAccordion
                        titulo="Receitas"
                        categoriasPai={receitas}
                        todasCategorias={categorias}
                        onEdit={setEditingCategoria}
                    />
                </div>

                <div className="overflow-hidden rounded-md border">
                    <TipoAccordion
                        titulo="Despesas"
                        categoriasPai={despesas}
                        todasCategorias={categorias}
                        onEdit={setEditingCategoria}
                    />
                </div>
            </div>

            {editingCategoria && (
                <CreateCategoriaDialog
                    categorias={categorias}
                    categoria={editingCategoria}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditingCategoria(null);
                    }}
                />
            )}
        </>
    );
}
