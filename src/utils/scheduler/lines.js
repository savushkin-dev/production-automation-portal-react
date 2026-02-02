

// Функция для конвертации линий
export function convertLines(data){
    let res = Object.entries(data)
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
    return res
}

// Функция для конвертации линий c временными полями
export function convertLinesWithTimeFields(data){
    let result = convertLines(data)
    return addTimeFields(result)
}

// Функция для добавления временных полей к массиву линий
export function addTimeFields(linesArray, startTime = "08:00", endTime = "08:00") {
    return linesArray.map(line => ({
        ...line,
        startDateTime: startTime,
        maxEndDateTime: endTime
    }));
}