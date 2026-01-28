import moment from 'moment';
import 'moment/locale/ru';

/**
 * Конфигурация moment.js для русского языка
 * Вызывается один раз при старте приложения
 */
export const configureMomentLocale = () => {
    moment.updateLocale('ru', {
        months: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_'),
        monthsShort: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split('_'),
        weekdays: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split('_'),
        weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
        weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_')
    });
};