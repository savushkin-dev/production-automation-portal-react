/**
 * Получает следующий день в формате YYYY-MM-DD (локальное время)
 * @param {Date|string} date - объект Date или строка даты
 * @returns {string} дата в формате YYYY-MM-DD
 */
export function getNextDateStr(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return formatLocalDateOnly(newDate);
}

/**
 * Получает предыдущий день в формате YYYY-MM-DD (локальное время)
 * @param {Date|string} date - объект Date или строка даты
 * @returns {string} дата в формате YYYY-MM-DD
 */
export function getPredDateStr(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return formatLocalDateOnly(newDate);
}

/**
 * Получает день после следующего в формате YYYY-MM-DD (локальное время)
 * @param {Date|string} date - объект Date или строка даты
 * @returns {string} дата в формате YYYY-MM-DD
 */
export function getNext2DateStr(date) {
    return getNextDateStr(getNextDateStr(date));
}

/**
 * Форматирует Date объект в YYYY-MM-DD (локальное время)
 * @param {Date} date - объект Date
 * @returns {string} дата в формате YYYY-MM-DD
 */
function formatLocalDateOnly(date) {
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Форматирует Date объект в YYYY-MM-DD HH:mm:ss (локальное время)
 * @param {Date} date - объект Date
 * @returns {string} дата в формате YYYY-MM-DD HH:mm:ss или пустая строка при ошибке
 */
function formatLocalDateTime(date) {
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Форматирует Date объект в YYYY-MM-DD HH:mm (локальное время, без секунд)
 * @param {Date} date - объект Date
 * @returns {string} дата в формате YYYY-MM-DD HH:mm или пустая строка при ошибке
 */
function formatLocalDateTimeWithoutSeconds(date) {
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Преобразует Date или ISO строку в формат YYYY-MM-DD HH:mm:ss
 * @param {Date|string} dateTime - объект Date или ISO строка
 * @returns {string} дата в формате YYYY-MM-DD HH:mm:ss или пустая строка при ошибке
 */
export function formatIsoToDatetimeRegex(dateTime) {
    if (!dateTime) return '';

    if (dateTime instanceof Date && !isNaN(dateTime)) {
        return formatLocalDateTime(dateTime);
    }

    if (typeof dateTime === 'string') {
        const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
    }

    return '';
}

/**
 * Преобразует Date или ISO строку в формат YYYY-MM-DD HH:mm (без секунд)
 * @param {Date|string} dateTime - объект Date или ISO строка
 * @returns {string} дата в формате YYYY-MM-DD HH:mm или пустая строка при ошибке
 */
export function formatIsoToDatetimeWithoutSeconds(dateTime) {
    if (!dateTime) return '';

    if (dateTime instanceof Date && !isNaN(dateTime)) {
        return formatLocalDateTimeWithoutSeconds(dateTime);
    }

    if (typeof dateTime === 'string') {
        const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
    }

    return '';
}

/**
 * Преобразует Date или ISO строку в формат YYYY-MM-DD
 * @param {Date|string} dateTime - объект Date или ISO строка
 * @returns {string} дата в формате YYYY-MM-DD или пустая строка при ошибке
 */
export function formatIsoToDateOnly(dateTime) {
    if (!dateTime) return '';

    if (dateTime instanceof Date && !isNaN(dateTime)) {
        return formatLocalDateOnly(dateTime);
    }

    if (typeof dateTime === 'string') {
        const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
            return match[1];
        }
    }

    return '';
}