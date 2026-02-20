
/**
 * Конвертирует объект линий в массив с сортировкой по номеру линии
 * @param {Object} data - Объект вида { lineId: lineName }
 * @returns {Array} - Массив объектов линий { id, name, lineId, originalName }
 */
export function convertLines(data){
    return  Object.entries(data)
        .map(([lineId, lineName], index) => ({
            id: String(index + 1),
            name: lineName.trim(),
            lineId: lineId,
            originalName: lineName.trim(),

        }))
        .sort((a, b) => {
            const numA = parseInt(a.name.match(/Линия №(\d+)/)?.[1] || 0);
            const numB = parseInt(b.name.match(/Линия №(\d+)/)?.[1] || 0);
            return numA - numB;
        });
}

/**
 * Конвертирует объект линий и добавляет временные поля
 * @param {Object} data - Объект вида { lineId: lineName }
 * @returns {Array} - Массив линий с полями startDateTime и maxEndDateTime
 */
export function convertLinesWithTimeFields(data){
    let result = convertLines(data)
    return addTimeFields(result)
}

/**
 * Добавляет временные поля к массиву линий
 * @param {Array} linesArray - Массив линий
 * @param {string} startTime - Время начала (по умолчанию "08:00")
 * @param {string} endTime - Время окончания (по умолчанию "08:00")
 * @returns {Array} - Массив линий с добавленными полями дат
 */
export function addTimeFields(linesArray, startTime = "08:00", endTime = "08:00") {
    return linesArray.map(line => ({
        ...line,
        startDateTime: startTime,
        maxEndDateTime: endTime
    }));
}

/**
 * Возвращает название линии по её lineId
 * @param {string} lineId - ID линии
 * @param {Array} lines - Массив линий
 * @returns {string} - Название линии или пустая строка
 */
export const getLineNameById = (lineId, lines) => {
    return lines?.find(line => line.lineId === lineId)?.name || '';
};

/**
 * Проверяет наличие валидных дат (startDateTime и maxEndDateTime) во всех линиях
 * @param {Array} lines - Массив линий для проверки
 * @returns {boolean} - true если все даты заполнены, иначе false
 */
export const isValidLinesDate = (lines) => {
    return lines?.every(line =>
        line.startDateTime != null && line.maxEndDateTime != null
    ) ?? false;
};