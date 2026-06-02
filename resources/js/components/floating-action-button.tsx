import { useHttp } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import TransacaoController from '@/actions/App/Http/Controllers/TransacaoController';
import CreateTransacaoDialog from '@/components/create-transacao-dialog';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { BanknoteArrowDown, BanknoteArrowUp, Plus, X } from 'lucide-react';

interface ContaOption {
    id: number;
    nome: string;
}

interface CategoriaOption {
    id: number;
    nome: string;
    tipo: number;
}

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogTipo, setDialogTipo] = useState<1 | 2 | null>(null);
    const [contas, setContas] = useState<ContaOption[] | null>(null);
    const [categorias, setCategorias] = useState<CategoriaOption[] | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const { currentUrl } = useCurrentUrl();
    const { get, processing } = useHttp({});

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (currentUrl.includes('/settings/')) {
        return null;
    }

    function handleFabClick() {
        const opening = !isOpen;
        setIsOpen(opening);

        if (opening && !contas) {
            get(TransacaoController.create.url(), {
                onSuccess: (response) => {
                    const data = response as { contas: ContaOption[]; categorias: CategoriaOption[] };
                    setContas(data.contas);
                    setCategorias(data.categorias);
                },
            });
        }
    }

    function openDialog(tipo: 1 | 2) {
        setIsOpen(false);
        setDialogTipo(tipo);
    }

    return (
        <>
            <div
                ref={ref}
                className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-0 md:right-16 md:bottom-12"
            >
                {isOpen && (
                    <div className="mr-12 flex flex-col overflow-hidden rounded-xl bg-white shadow-lg dark:bg-zinc-900">
                        <button
                            onClick={() => openDialog(1)}
                            disabled={processing}
                            className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-zinc-800"
                        >
                            <BanknoteArrowUp className="size-5 text-emerald-400" />
                            <span>Nova receita</span>
                        </button>
                        <div className="mx-4 border-t border-gray-100 dark:border-zinc-800" />
                        <button
                            onClick={() => openDialog(2)}
                            disabled={processing}
                            className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-zinc-800"
                        >
                            <BanknoteArrowDown className="size-5 text-red-400" />
                            <span>Nova despesa</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={handleFabClick}
                    className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-colors hover:bg-teal-700"
                    aria-label={isOpen ? 'Fechar menu' : 'Adicionar transação'}
                >
                    {isOpen ? <X className="size-6" /> : <Plus className="size-6" />}
                </button>
            </div>

            {dialogTipo !== null && contas && categorias && (
                <CreateTransacaoDialog
                    contas={contas}
                    categorias={categorias}
                    tipoFixo={dialogTipo}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setDialogTipo(null);
                    }}
                />
            )}
        </>
    );
}
