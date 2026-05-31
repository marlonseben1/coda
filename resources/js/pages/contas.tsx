import { Head } from '@inertiajs/react';
import { dashboard, contas } from '@/routes';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function Contas() {
    return (
        <>
            <Head title="Contas" />
        </>
    );
}

Contas.layout = {
    breadcrumbs: [
        {
            title: 'Contas',
            href: contas(),
        },
    ],
};
