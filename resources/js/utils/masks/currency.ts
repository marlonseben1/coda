export function formatCurrency(digits: string): string {
    const raw = digits.replace(/\D/g, '');
    if (!raw) return '';

    const padded = raw.padStart(3, '0');
    const cents = padded.slice(-2);
    const reais = String(parseInt(padded.slice(0, -2), 10));
    const reaisFormatted = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${reaisFormatted},${cents}`;
}

export function toNumericValue(formatted: string): string {
    const digits = formatted.replace(/\D/g, '');
    if (!digits) return '';
    return (parseInt(digits, 10) / 100).toFixed(2);
}

export function decimalToDisplay(value: string | number): string {
    const num = parseFloat(String(value));
    if (isNaN(num)) return '';
    const parts = num.toFixed(2).split('.');
    const reais = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${reais},${parts[1]}`;
}
