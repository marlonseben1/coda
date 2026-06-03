import { Head } from '@inertiajs/react';
import { type CategoriaData } from '@/components/create-categoria-dialog';
import CategoriasAccordion from '@/components/categorias-accordion';
import CreateCategoriaDialog from '@/components/create-categoria-dialog';
import { categorias } from '@/routes';

interface Props {
    categorias: CategoriaData[];
}

export default function Categorias({ categorias }: Props) {
    return (
        <>
            <Head title="Categorias" />

            <div className="page-content">
                <div className="flex justify-end">
                    <CreateCategoriaDialog categorias={categorias} />
                </div>

                <div className="mx-auto max-w-2xl">
                    <CategoriasAccordion categorias={categorias} />
                </div>
            </div>
        </>
    );
}

Categorias.layout = {
    breadcrumbs: [{ title: 'Categorias', href: categorias() }],
};
