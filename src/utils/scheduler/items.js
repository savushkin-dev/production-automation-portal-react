//Проверяет или это отдельный фактический элемент
export function isFactItem(item) {
    return item.id.endsWith("fact_camera")
}

//Определяет если ли уже факт
export function isPackagedItem(item) {
    return item.info.startFact !== null
}

//Определяет является ли сервисной операцией
export function isMaintenanceItem(item) {
    return item.info.maintenance === true
}

export const getLastItemIndexInGroup = (groupId, plan) => {
    const groupItems = filterGroupItems(groupId, plan)
    if (groupItems.length === 0) {
        return 0;
    }
    return groupItems.length - 1;
};

export const getLastItemInGroup = (groupId, plan) => {
    const groupItems = filterGroupItems(groupId, plan)
    if (groupItems.length === 0) {
        return null;
    }
    return groupItems[groupItems.length-1];
};

export const filterGroupItems = (groupId, plan) => {
    // Фильтруем элементы по группе и ИСКЛЮЧАЕМ мойки и фактические элементы
    return plan.filter(item => item.group === groupId && !item.id.includes('cleaning') && !item.id.includes('delay') && !isFactItem(item))
        .sort((a, b) => a.start_time - b.start_time);
}

//Определяет является ли тип сервисной операции "Фасовка" или "Выравнивание"
export function isMaintenancePackingOrLeveling(item) {
    return (item.info.maintenanceTypeId === 7) || (item.info.maintenanceTypeId === 8);
}

//Определяет является ли задержкой
export function isDelayItem(item) {
    return item.id.includes('delay');
}

//Определяет является ли мойкой
export function isCleaningItem(item) {
    return item.id.includes('cleaning');
}

//Определяет сколько времени до 8 утра
export const calculateTimeToNext8AM = (inputTime) => {
    const startDate = new Date(inputTime);

    // Устанавливаем следующие 8 утра от входного времени
    const next8AM = new Date(startDate);
    next8AM.setHours(8, 0, 0, 0); // 8:00:00.000

    // Если входное время уже после 8 утра, берем следующие сутки
    if (startDate > next8AM) {
        next8AM.setDate(next8AM.getDate() + 1);
    }

    const diffMs = next8AM - startDate;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
        hours: diffHours,
        minutes: diffMinutes
    };
};