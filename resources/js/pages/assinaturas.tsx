import { assinaturas } from '@/routes';
import { Head } from '@inertiajs/react';

export default function Assinaturas() {
    return (
        <>
            <Head title="Assinaturas" />
        </>
    );
}

Assinaturas.layout = {
    breadcrumbs: [
        {
            title: 'Assinaturas',
            href: assinaturas(),
        },
    ],
};
