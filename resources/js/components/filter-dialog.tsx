import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface FilterField {
    key: string;
    label: string;
    allLabel?: string;
    options: { value: string; label: string }[];
}

interface Props {
    filters: Record<string, string | undefined>;
    fields: FilterField[];
    onApply: (filters: Record<string, string | undefined>) => void;
    onClear: () => void;
}

export default function FilterDialog({ filters, fields, onApply, onClear }: Props) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<Record<string, string | undefined>>(filters);

    const activeCount = Object.values(filters).filter(Boolean).length;

    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) {
            setPending(filters);
        }
        setOpen(nextOpen);
    }

    function handleApply() {
        onApply(pending);
        setOpen(false);
    }

    function handleClear() {
        setPending({});
        onClear();
        setOpen(false);
    }

    return (
        <div className="flex items-center gap-3">
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)} className="relative">
                    <SlidersHorizontal className="size-4" />
                    Filtros
                    {activeCount > 0 && (
                        <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                            {activeCount}
                        </span>
                    )}
                </Button>

                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Filtros</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.key} className="grid gap-1.5">
                                <Label>{field.label}</Label>
                                <Select
                                    value={pending[field.key] ?? 'all'}
                                    onValueChange={(v) =>
                                        setPending((p) => ({ ...p, [field.key]: v === 'all' ? undefined : v }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{field.allLabel ?? 'Todos'}</SelectItem>
                                        {field.options.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="flex-row justify-between sm:justify-between">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                                Limpar filtros
                            </Button>
                        </DialogClose>
                        <Button type="button" size="sm" onClick={handleApply}>
                            Aplicar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {activeCount > 0 && (
                <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={onClear}
                >
                    Limpar filtros
                </button>
            )}
        </div>
    );
}
