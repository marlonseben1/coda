import { useEffect, useRef, useState } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Plus,
    X,
} from 'lucide-react';

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { currentUrl } = useCurrentUrl();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (currentUrl.includes('/settings/')) {
        return null;
    }

    return (
        <div
            ref={ref}
            className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-0 md:right-16 md:bottom-12"
        >
            {isOpen && (
                <div className="mr-12 flex flex-col overflow-hidden rounded-xl bg-white shadow-lg dark:bg-zinc-900">
                    <button className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <BanknoteArrowUp className="size-5 text-emerald-400" />
                        <span>Nova receita</span>
                    </button>
                    <div className="mx-4 border-t border-gray-100 dark:border-zinc-800" />
                    <button className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800">
                        <BanknoteArrowDown className="size-5 text-red-400" />
                        <span>Nova despesa</span>
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-colors hover:bg-teal-700"
                aria-label={isOpen ? 'Fechar menu' : 'Adicionar transação'}
            >
                {isOpen ? (
                    <X className="size-6" />
                ) : (
                    <Plus className="size-6" />
                )}
            </button>
        </div>
    );
}
