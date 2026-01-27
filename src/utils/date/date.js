

export function getNextDateStr(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate.toISOString().split('T')[0];
}

export function getPredDateStr(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate.toISOString().split('T')[0];
}

export function getNext2DateStr(date){
    return getNextDateStr(getNextDateStr(date));
}

/**
 * Преобразует ISO дату в формат YYYY-MM-DD HH:mm:ss
 * Убирает T и миллисекунды (если они есть)
 * @param {string} isoDate - дата в ISO формате (2026-01-26T17:58:04.653 или 2026-01-26T17:58:04)
 * @returns {string} дата в формате YYYY-MM-DD HH:mm:ss или пустая строка при ошибке
 */
export function formatIsoToDatetimeRegex(isoDate) {
    if (!isoDate) return '';

    const match = isoDate.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);

    if (match) {
        return `${match[1]} ${match[2]}`;
    }

    return '';
}