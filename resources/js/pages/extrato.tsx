import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard, extrato } from '@/routes';

export default function Extrato() {
    return (
        <>
            <Head title="Extrato" />
        </>
    );
}

Extrato.layout = {
    breadcrumbs: [
        {
            title: 'Extrato',
            href: extrato(),
        },
    ],
};
