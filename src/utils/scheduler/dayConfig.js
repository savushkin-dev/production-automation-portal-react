import {
    getDateCurrent,
    getDateMinus1,
    getDateMinus2,
    getDatePlus1,
    getDatePlus2,
    getDatePlus3,
    getDatePlus4,
    getDatePlus5,
    getDatePlus6,
    getDatePlus7,
} from "./pdayParsing";

// Конфигурация всех дней для DataTable
export const DAYS_CONFIG = [
    {
        key: 'dayMinus2',
        getDate: getDateMinus2,
        label: '-2 дня',
        order: 1
    },
    {
        key: 'dayMinus1',
        getDate: getDateMinus1,
        label: '-1 день',
        order: 2
    },
    {
        key: 'currentDay',
        getDate: getDateCurrent,
        label: 'Сегодня',
        order: 3
    },
    {
        key: 'dayPlus1',
        getDate: getDatePlus1,
        label: '+1 день',
        order: 4
    },
    {
        key: 'dayPlus2',
        getDate: getDatePlus2,
        label: '+2 дня',
        order: 5
    },
    {
        key: 'dayPlus3',
        getDate: getDatePlus3,
        label: '+3 дня',
        order: 6
    },
    {
        key: 'dayPlus4',
        getDate: getDatePlus4,
        label: '+4 дня',
        order: 7
    },
    {
        key: 'dayPlus5',
        getDate: getDatePlus5,
        label: '+5 дней',
        order: 8
    },
    {
        key: 'dayPlus6',
        getDate: getDatePlus6,
        label: '+6 дней',
        order: 9
    },
    {
        key: 'dayPlus7',
        getDate: getDatePlus7,
        label: '+7 дней',
        order: 10
    }
];

// Вспомогательная функция для обновления конкретного дня
export const updateDayData = (prevData, dayKey, newData) => ({
    ...prevData,
    [dayKey]: newData
});