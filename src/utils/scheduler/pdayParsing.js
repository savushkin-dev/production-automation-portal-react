import moment from 'moment';
import 'moment/locale/ru';

export function groupDataByDay(data, baseDate) {

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
        selectJobs: {}
    };

    const days = {
        dayMinus2: baseDate.clone().subtract(2, 'days'),
        dayMinus1: baseDate.clone().subtract(1, 'day'),
        currentDay: baseDate.clone(),
        dayPlus1: baseDate.clone().add(1, 'day'),
        dayPlus2: baseDate.clone().add(2, 'days'),
        dayPlus3: baseDate.clone().add(3, 'days'),
        dayPlus4: baseDate.clone().add(4, 'days'),
        dayPlus5: baseDate.clone().add(5, 'days'),
        dayPlus6: baseDate.clone().add(6, 'days')
    };

    data.forEach(item => {
        if (!item.dti) return;

        const itemDate = moment(item.dti);
        const dataWithSelection = {
            ...item,
            isSelected: false
        };

        // Определяем занятость и добавляем признак ручной стикеровки
        if (item.snpz) {
            let isSelect = item.startProductionDateTime !== "" && item.startProductionDateTime !== null;
            result.selectJobs[item.snpz] = {
                isSelect: isSelect,
                isLabeling: false
            };
        }

        if (itemDate.isSame(days.dayMinus2, 'day')) {
            result.dayMinus2.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayMinus1, 'day')) {
            result.dayMinus1.push(dataWithSelection);
        } else if (itemDate.isSame(days.currentDay, 'day')) {
            result.currentDay.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus1, 'day')) {
            result.dayPlus1.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus2, 'day')) {
            result.dayPlus2.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus3, 'day')) {
            result.dayPlus3.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus4, 'day')) {
            result.dayPlus4.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus5, 'day')) {
            result.dayPlus5.push(dataWithSelection);
        } else if (itemDate.isSame(days.dayPlus6, 'day')) {
            result.dayPlus6.push(dataWithSelection);
        }
    });

    return result;
}

// Функции для получения дат (добавьте их, если еще нет)
export const getDateMinus2 = (date) => moment(date).subtract(2, 'days').format('DD.MM.YYYY');
export const getDateMinus1 = (date) => moment(date).subtract(1, 'day').format('DD.MM.YYYY');
export const getDateCurrent = (date) => moment(date).format('DD.MM.YYYY');
export const getDatePlus1 = (date) => moment(date).add(1, 'day').format('DD.MM.YYYY');
export const getDatePlus2 = (date) => moment(date).add(2, 'days').format('DD.MM.YYYY');
export const getDatePlus3 = (date) => moment(date).add(3, 'days').format('DD.MM.YYYY');
export const getDatePlus4 = (date) => moment(date).add(4, 'days').format('DD.MM.YYYY');
export const getDatePlus5 = (date) => moment(date).add(5, 'days').format('DD.MM.YYYY');
export const getDatePlus6 = (date) => moment(date).add(6, 'days').format('DD.MM.YYYY');