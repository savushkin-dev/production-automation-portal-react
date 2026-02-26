import moment from "moment/moment";


export const formatTimelineLabel = (date, unit, width, height) => {
    if (Array.isArray(date) && date.length === 2 && date[0] === 'Y' && date[1] === 'Y') {
        return '';
    }
    if (!date || isNaN(new Date(date[0].$d).getTime())) {
        console.warn('Invalid date in timeline:', date);
        return '--:--';
    }

    const momentDate = moment(date[0].$d);

    if (!momentDate.isValid()) {
        return '--:--';
    }

    if (unit === 'minute') {
        return momentDate.format('mm');
    }

    if (unit === 'hour') {
        if (width < 40) return momentDate.format('HH');
        return momentDate.format('HH:mm');
    }

    if (unit === 'day') {
        if (width < 30) return momentDate.format('DD');
        if (width < 60) return momentDate.format('DD.MM');
        if (width < 120) return momentDate.format('dd DD.MM');
        return momentDate.format('dddd DD.MM');
    }

    if (unit === 'month') {
        if (width < 80) return momentDate.format('MM');
        return momentDate.format('MMMM');
    }

    return momentDate.format('DD.MM HH:mm');
};


export const formatTimelineLabelMain = (date, unit, width, height) => {
    if (Array.isArray(date) && date.length === 2 && date[0] === 'Y' && date[1] === 'Y') {
        return '';
    }
    if (!date || isNaN(new Date(date[0].$d).getTime())) {
        console.warn('Invalid date in timeline:', date);
        return '--:--';
    }

    const momentDate = moment(date[0].$d);

    if (!momentDate.isValid()) {
        return '--:--';
    }

    if (unit === 'hour') {
        return momentDate.format('dddd, LL HH:00');
    }

    if (unit === 'day') {
        return momentDate.format('dddd, LL');
    }

    if (unit === 'month') {
        if (width < 80) return momentDate.format('MM');
        return momentDate.format('MMMM');
    }

    return momentDate.format('YYYY');
};