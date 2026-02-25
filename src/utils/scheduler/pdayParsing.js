import moment from 'moment';
import 'moment/locale/ru';

/**
 * Группирует данные по дням от -2 до +7 относительно базовой даты
 * @param {Array} data - Массив данных
 * @param {string|Date|moment} baseDate - Базовая дата (выбранная дата)
 * @returns {Object} - Объект с группами по дням и selectJobs
 */
export function groupDataByDay(data, baseDate) {
    const baseMoment = moment(baseDate).startOf('day');

    if (!baseMoment.isValid()) {
        console.error('Невалидная baseDate:', baseDate);
        return getEmptyResult();
    }

    const targetDays = {
        dayMinus2: moment(baseMoment).subtract(2, 'days').format('YYYY-MM-DD'),
        dayMinus1: moment(baseMoment).subtract(1, 'day').format('YYYY-MM-DD'),
        currentDay: moment(baseMoment).format('YYYY-MM-DD'),
        dayPlus1: moment(baseMoment).add(1, 'day').format('YYYY-MM-DD'),
        dayPlus2: moment(baseMoment).add(2, 'days').format('YYYY-MM-DD'),
        dayPlus3: moment(baseMoment).add(3, 'days').format('YYYY-MM-DD'),
        dayPlus4: moment(baseMoment).add(4, 'days').format('YYYY-MM-DD'),
        dayPlus5: moment(baseMoment).add(5, 'days').format('YYYY-MM-DD'),
        dayPlus6: moment(baseMoment).add(6, 'days').format('YYYY-MM-DD'),
        dayPlus7: moment(baseMoment).add(7, 'days').format('YYYY-MM-DD')
    };

    const result = {
        dayMinus2: [],
        dayMinus1: [],
        currentDay: [],
        dayPlus1: [],
        dayPlus2: [],
        dayPlus3: [],
        dayPlus4: [],
        dayPlus5: [],
        dayPlus6: [],
        dayPlus7: [],
        selectJobs: {}
    };

    if (!Array.isArray(data)) return result;

    data.forEach(item => {
        if (!item?.dti) return;

        // (первые 10 символов YYYY-MM-DD)
        const itemDate = item.dti.substring(0, 10);


        const dataWithSelection = { ...item, isSelected: false };

        // Определяем занятость
        if (item.snpz) {
            const isSelect = item.startProductionDateTime !== "" &&
                item.startProductionDateTime !== null;
            result.selectJobs[item.snpz] = {
                isSelect: isSelect,
                isLabeling: false
            };
        }

        // Группировка по дням
        if (itemDate === targetDays.dayMinus2) {
            result.dayMinus2.push(dataWithSelection);
        } else if (itemDate === targetDays.dayMinus1) {
            result.dayMinus1.push(dataWithSelection);
        } else if (itemDate === targetDays.currentDay) {
            result.currentDay.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus1) {
            result.dayPlus1.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus2) {
            result.dayPlus2.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus3) {
            result.dayPlus3.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus4) {
            result.dayPlus4.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus5) {
            result.dayPlus5.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus6) {
            result.dayPlus6.push(dataWithSelection);
        } else if (itemDate === targetDays.dayPlus7) {
            result.dayPlus7.push(dataWithSelection);
        }
    });

    return result;
}

// Функции для форматирования
export const getDateMinus2 = (date) => moment(date).subtract(2, 'days').format('DD.MM.YYYY');
export const getDateMinus1 = (date) => moment(date).subtract(1, 'day').format('DD.MM.YYYY');
export const getDateCurrent = (date) => moment(date).format('DD.MM.YYYY');
export const getDatePlus1 = (date) => moment(date).add(1, 'day').format('DD.MM.YYYY');
export const getDatePlus2 = (date) => moment(date).add(2, 'days').format('DD.MM.YYYY');
export const getDatePlus3 = (date) => moment(date).add(3, 'days').format('DD.MM.YYYY');
export const getDatePlus4 = (date) => moment(date).add(4, 'days').format('DD.MM.YYYY');
export const getDatePlus5 = (date) => moment(date).add(5, 'days').format('DD.MM.YYYY');
export const getDatePlus6 = (date) => moment(date).add(6, 'days').format('DD.MM.YYYY');
export const getDatePlus7 = (date) => moment(date).add(7, 'days').format('DD.MM.YYYY');

function getEmptyResult() {
    return {
        dayMinus2: [], dayMinus1: [], currentDay: [],
        dayPlus1: [], dayPlus2: [], dayPlus3: [],
        dayPlus4: [], dayPlus5: [], dayPlus6: [], dayPlus7: [],
        selectJobs: {}
    };
}