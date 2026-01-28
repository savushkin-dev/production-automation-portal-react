import moment from 'moment';
import 'moment/locale/ru';


export function groupDataByDay(data, baseDate) {
    const previousDay = baseDate.clone().subtract(1, 'day');
    const nextDay = baseDate.clone().add(1, 'day');
    const next2Day = baseDate.clone().add(2, 'day');

    const result = {
        previousDay: [],
        currentDay: [],
        nextDay: [],
        next2Day: [],
        selectJobs: {}
    };

    data.forEach(item => {
        if (!item.dti) return;

        const itemDate = moment(item.dti);
        const dataWithSelection = {
            ...item,
            isSelected: false
        };

        // Определяем занятость
        if (item.snpz) {
            result.selectJobs[item.snpz] = item.startProductionDateTime !== "" && item.startProductionDateTime !== null; // Занятые = true, свободные = false
        }

        // Определяем день
        if (itemDate.isSame(previousDay, 'day')) {
            result.previousDay.push(dataWithSelection);
        } else if (itemDate.isSame(baseDate, 'day')) {
            result.currentDay.push(dataWithSelection);
        } else if (itemDate.isSame(nextDay, 'day')) {
            result.nextDay.push(dataWithSelection);
        } else if (itemDate.isSame(next2Day, 'day')) {
            result.next2Day.push(dataWithSelection);
        }
    });

    return result;
}