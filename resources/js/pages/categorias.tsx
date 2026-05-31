import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { categorias } from '@/routes';
import { Head } from '@inertiajs/react';

export default function Categorias() {
    return (
        <>
            <Head title="Categorias" />
        </>
    );
}

Categorias.layout = {
    breadcrumbs: [
        {
            title: 'Categorias',
            href: categorias(),
        },
    ],
};
