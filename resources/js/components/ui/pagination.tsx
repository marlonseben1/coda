import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginatorLink[];
    className?: string;
}

export default function Pagination({ links, className }: Props) {
    if (links.length <= 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <div className={cn('flex items-center justify-center gap-1', className)}>
            {prev.url ? (
                <Button variant="outline" size="icon" asChild>
                    <Link href={prev.url}>
                        <ChevronLeft className="size-4" />
                        <span className="sr-only">Anterior</span>
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">Anterior</span>
                </Button>
            )}

            {pages.map((page, i) =>
                page.url === null ? (
                    <span key={i} className="px-1 text-sm text-muted-foreground">
                        …
                    </span>
                ) : (
                    <Button key={i} variant={page.active ? 'default' : 'outline'} size="icon" asChild={!page.active}>
                        {page.active ? (
                            <span>{page.label}</span>
                        ) : (
                            <Link href={page.url}>{page.label}</Link>
                        )}
                    </Button>
                ),
            )}

            {next.url ? (
                <Button variant="outline" size="icon" asChild>
                    <Link href={next.url}>
                        <ChevronRight className="size-4" />
                        <span className="sr-only">Próximo</span>
                    </Link>
                </Button>
            ) : (
                <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="size-4" />
                    <span className="sr-only">Próximo</span>
                </Button>
            )}
        </div>
    );
}
