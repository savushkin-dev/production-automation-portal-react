
export function isFactItem(item) {
    return item.id.endsWith("fact_camera")
}

export const getLastItemIndexInGroup = (groupId, plan) => {
    // Фильтруем элементы по группе и ИСКЛЮЧАЕМ мойки и фактические элементы
    const groupItems = plan
        .filter(item => item.group === groupId && !item.id.includes('cleaning') && !isFactItem(item))
        .sort((a, b) => a.start_time - b.start_time);

    if (groupItems.length === 0) {
        return -1;
    }

    return groupItems.length - 1;
};