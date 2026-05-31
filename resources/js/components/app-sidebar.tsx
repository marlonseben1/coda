import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    FolderSync,
    Grid2X2,
    House,
    LayoutGrid,
    Tickets,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { assinaturas, categorias, contas, dashboard, extrato } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: House,
    },
    {
        title: 'Extrato',
        href: extrato(),
        icon: FolderSync,
    },
    {
        title: 'Contas',
        href: contas(),
        icon: Wallet,
    },
    {
        title: 'Assinaturas',
        href: assinaturas(),
        icon: Tickets,
    },
    {
        title: 'Categorias',
        href: categorias(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repositório',
        href: 'https://github.com/marlonseben1/coda',
        icon: FolderGit2,
    },
    {
        title: 'Documentação',
        href: 'https://github.com/marlonseben1/coda',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
