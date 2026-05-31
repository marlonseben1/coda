export function todayDate(): string {
    return new Intl.DateTimeFormat('en-CA').format(new Date());
}

export function formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}
