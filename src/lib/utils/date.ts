export function getRelativeTime(date: Date): string {
    const now = new Date();

    // Strip time for true day comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = Math.abs(today.getTime() - inputDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return 'ayer';

    return `hace ${diffDays} días`;
}
