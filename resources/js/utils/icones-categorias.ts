import {
    BadgeDollarSign,
    Briefcase,
    Car,
    Clapperboard,
    Coffee,
    Droplet,
    Dumbbell,
    Gift,
    GraduationCap,
    Hamburger,
    Heart,
    Home,
    Plane,
    Pill,
    PawPrint,
    Scissors,
    Shield,
    ShoppingCart,
    Shirt,
    TrendingUp,
    Utensils,
    Volleyball,
    Wifi,
    Wrench,
    Zap,
    type LucideIcon,
} from 'lucide-react';

export interface IconeCategoria {
    name: string;
    label: string;
    icon: LucideIcon;
}

export const ICONES_CATEGORIAS: IconeCategoria[] = [
    { name: 'Utensils', label: 'Alimentação', icon: Utensils },
    { name: 'Car', label: 'Transporte', icon: Car },
    { name: 'Home', label: 'Moradia', icon: Home },
    { name: 'Heart', label: 'Saúde', icon: Heart },
    { name: 'GraduationCap', label: 'Educação', icon: GraduationCap },
    { name: 'Plane', label: 'Viagem', icon: Plane },
    { name: 'Shirt', label: 'Vestuário', icon: Shirt },
    { name: 'Dumbbell', label: 'Academia', icon: Dumbbell },
    { name: 'Coffee', label: 'Café', icon: Coffee },
    { name: 'ShoppingCart', label: 'Compras', icon: ShoppingCart },
    { name: 'Wifi', label: 'Internet', icon: Wifi },
    { name: 'Zap', label: 'Energia', icon: Zap },
    { name: 'TrendingUp', label: 'Investimento', icon: TrendingUp },
    { name: 'Briefcase', label: 'Trabalho', icon: Briefcase },
    { name: 'Gift', label: 'Presentes', icon: Gift },
    { name: 'Pill', label: 'Farmácia', icon: Pill },
    { name: 'PawPrint', label: 'Pets', icon: PawPrint },
    { name: 'Wrench', label: 'Manutenção', icon: Wrench },
    { name: 'Volleyball', label: 'Esportes', icon: Volleyball },
    { name: 'Clapperboard', label: 'Cinema', icon: Clapperboard },
    { name: 'Hamburger', label: 'Rolê', icon: Hamburger },
    { name: 'Droplet', label: 'Água', icon: Droplet },
    { name: 'BadgeDollarSign', label: 'Impostos', icon: BadgeDollarSign },
    { name: 'Shield', label: 'Seguros', icon: Shield },
    { name: 'Scissors', label: 'Barbeiro', icon: Scissors },
];

export const iconesPorNome = Object.fromEntries(
    ICONES_CATEGORIAS.map(({ name, icon }) => [name, icon]),
) as Record<string, LucideIcon>;
