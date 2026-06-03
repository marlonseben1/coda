import { Pie, PieChart } from 'recharts';

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatSaldo } from '@/utils/currency/currency';

export interface CategoriaItem {
    nome: string;
    total: number;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    data: CategoriaItem[];
    colorOffset?: number;
    emptyMessage?: string;
}

const CATEGORIA_COLORS = ['#f87171', '#fb923c', '#60a5fa', '#4ade80'];
const OUTROS_COLOR = '#9ca3af';
const PIE_CONFIG: ChartConfig = {};

function getColor(index: number, nome: string, offset: number): string {
    if (nome === 'Outros') return OUTROS_COLOR;
    return CATEGORIA_COLORS[(index + offset) % CATEGORIA_COLORS.length];
}

export function CategoriaPieChartDialog({
    open,
    onOpenChange,
    title,
    description,
    data,
    colorOffset = 0,
    emptyMessage = 'Nenhum dado registrado este mês.',
}: Props) {
    const chartData = data.map((d, i) => ({
        ...d,
        fill: getColor(i, d.nome, colorOffset),
    }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {chartData.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                        <div className="shrink-0">
                            <ChartContainer config={PIE_CONFIG} className="h-[220px] w-[220px]">
                                <PieChart>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                nameKey="nome"
                                                formatter={(value, name, item) => (
                                                    <>
                                                        <div
                                                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                            style={{ backgroundColor: item.payload?.fill }}
                                                        />
                                                        <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                                                            <span className="text-muted-foreground">{name}</span>
                                                            <span className="font-mono font-medium tabular-nums">
                                                                {formatSaldo(Number(value))}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            />
                                        }
                                    />
                                    <Pie
                                        data={chartData}
                                        dataKey="total"
                                        nameKey="nome"
                                        outerRadius={100}
                                        strokeWidth={2}
                                        stroke="hsl(var(--card))"
                                    />
                                </PieChart>
                            </ChartContainer>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {chartData.map((d) => (
                                <div key={d.nome} className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 shrink-0 rounded-sm"
                                        style={{ backgroundColor: d.fill }}
                                    />
                                    <span className="text-sm">{d.nome}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
