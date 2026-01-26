

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