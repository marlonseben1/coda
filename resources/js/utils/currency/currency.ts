export function formatSaldo(value: string | number): string {
    const num = parseFloat(String(value));
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
