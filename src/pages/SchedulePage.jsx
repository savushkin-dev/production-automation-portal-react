import "./../App.css";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import moment from 'moment';
import 'moment/locale/ru';

import {Timeline, TimelineHeaders, SidebarHeader, DateHeader, CustomHeader} from "react-calendar-timeline";
import ScheduleService from "../services/ScheduleService";
import SchedulerService from "../services/ScheduleService";
import "./../components/scheduler/scheduler.css"
import {ModalInfoItem} from "../components/scheduler/ModalInfoItem";
import {ModalDateSettings} from "../components/scheduler/ModalDateSettings";
import {ModalAnalyze} from "../components/scheduler/ModalAnalyze";
import {ModalNotify} from "../components/modal/ModalNotify";
import {observer} from "mobx-react-lite";
import {ModalConfirmation} from "../components/modal/ModalConfirmation";
import {DropDownActionsItem} from "../components/scheduler/DropDownActionsItem";
import {ModalMoveJobs} from "../components/scheduler/ModalMoveJobs";
import {DataTable} from "../components/scheduler/DataTable";
import {ModalAssignServiceWork} from "../components/scheduler/ModalAssignServiceWork";

// Принудительно устанавливаем русскую локаль
moment.updateLocale('ru', {
    months: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_'),
    monthsShort: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split('_'),
    weekdays: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split('_'),
    weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
    weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_')
});

function SchedulerPage() {

    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(true);

    const stylePartyBut = isDisplayByHardware ? " hover:bg-gray-100" : " bg-blue-800 hover:bg-blue-700 text-white";
    const styleHardwareBut = isDisplayByHardware ? " bg-blue-800 hover:bg-blue-700 text-white" : " hover:bg-gray-100";

    const [party, setParty] = useState([]);
    const [planByParty, setPlanByParty] = useState([]);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);
    const [pdayData, setPdayData] = useState([]);
    const [pdayDataNextDay, setPdayDataNextDay] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalRemove, setIsModalRemove] = useState(false);
    const [isModalInfoItem, setIsModalInfoItem] = useState(false);
    const [isModalMoveJobs, setIsModalMoveJobs] = useState(false);
    const [isModalAssignServiceWork, setIsModalAssignServiceWork] = useState(false);

    const [isSolve, setIsSolve] = useState(false);
    const [score, setScore] = useState({hard: 0, medium: 0, soft: 0});
    const [solverStatus, setSolverStatus] = useState("");

    const [isModalDateSettings, setIsModalDateSettings] = useState(false);
    const [isModalAnalyze, setIsModalAnalyze] = useState(false);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [analyzeObj, setAnalyzeObj] = useState(null);

    const [selectDate, setSelectDate] = useState(new Date(new Date().setDate(new Date().getDate() - 0)).toISOString().split('T')[0])
    const [selectEndDate, setSelectEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])

    const [idealEndDateTime, setIdealEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T02:00'));
    const [maxEndDateTime, setMaxEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T03:00'));

    const [selectDateTable, setSelectDateTable] = useState(new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0])

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        item: null,
        forCanvas: false,
    })

    const [startTimeLines, setStartTimeLines] = useState(undefined);
    const [timelineKey, setTimelineKey] = useState(0);

    const [currentUnit, setCurrentUnit] = useState('hour');

    async function assignSettings() {
        const lineTimes = startTimeLines.reduce((acc, line) => {
            acc[line.lineId] = line.startDateTime;
            return acc;
        }, {});

        try {
            setVisibleTimeRange(prevState => ({
                ...prevState,
                visibleTimeStart: moment(selectDate).startOf('day').add(-2, 'hour'),
                visibleTimeEnd: moment(selectDate).startOf('day').add(30, 'hour')
            }));

            await SchedulerService.assignSettings(selectDate, selectEndDate, idealEndDateTime, maxEndDateTime, lineTimes);
            await fetchPlan()
            setPdayDataNextDay([])
        } catch (e) {
            console.error(e)
            setMsg(e.response.data.error)
            setIsModalNotify(true);
            setItems([])
            setScore({hard: 0, medium: 0, soft: 0})
            setPdayData([])
            setPdayDataNextDay([])
        }
    }

    function getNextDateStr(date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toISOString().split('T')[0];
    }

    async function loadPday() {
        const lineTimes = startTimeLines.reduce((acc, line) => {
            acc[line.lineId] = line.startDateTime;
            return acc;
        }, {});

        try {
            const date = new Date(selectDateTable);
            date.setDate(date.getDate() + 1);
            const selectDatePlusDay = date.toISOString().split('T')[0];
            const response = await SchedulerService.loadPday(selectDateTable, selectDatePlusDay, idealEndDateTime, maxEndDateTime, lineTimes);
            setPdayData(response.data)
        } catch (e) {
            console.error(e)
            setMsg(e.response.data.error)
            setIsModalNotify(true);
            setPdayData([])
        }
    }

    async function loadPdayNextDay() {
        const lineTimes = startTimeLines.reduce((acc, line) => {
            acc[line.lineId] = line.startDateTime;
            return acc;
        }, {});

        try {
            const date = new Date(selectDateTable);
            date.setDate(date.getDate() + 1);
            const selectDatePlusDay = date.toISOString().split('T')[0];
            date.setDate(date.getDate() + 1);
            const selectDatePlus2Day = date.toISOString().split('T')[0];

            const responseNextDay = await SchedulerService.loadPday(selectDatePlusDay, selectDatePlus2Day, idealEndDateTime, maxEndDateTime, lineTimes);
            setPdayDataNextDay(responseNextDay.data)
        } catch (e) {
            console.error(e)
            setMsg(e.response.data.error)
            setIsModalNotify(true);
            setPdayData([])
        }
    }

    async function updatePday(body) {
        try {
            return await SchedulerService.updatePday(body)
        } catch (e) {
            console.error(e)
            setMsg("Не удалось отметить задачу")
            setIsModalNotify(true);
            throw e;
        }
    }

    useEffect(() => {
        if(startTimeLines){
            loadPday()
        }
        setPdayDataNextDay([])
    }, [selectDate, selectDateTable])

    async function savePlan() {
        try {
            await SchedulerService.savePlan();
            setMsg("План успешно сохранен.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сохранения отчета: " + e.message)
            setIsModalNotify(true);
        }
    }

    async function removePlan() {
        try {
            await SchedulerService.removePlan();
            setMsg("План успешно удален.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка удаления отчета: " + e.message)
            setIsModalNotify(true);
        }
    }

    function clickRemovePlan() {
        setMsg("Вы уверены что хотите удалить план?")
        setIsModalRemove(true);
    }

    async function fetchLines() {
        try {
            const response = await SchedulerService.getLines();

            setStartTimeLines(Object.entries(response.data)
                .map(([lineId, lineName], index) => ({
                    id: String(index + 1),
                    name: lineName.trim(),
                    lineId: lineId,
                    originalName: lineName.trim(),
                    startDateTime: "08:00"
                })))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка загрузки линий отчета: " + e.message)
            setIsModalNotify(true);
        }
    }

    async function fetchSolve() {
        try {
            await SchedulerService.solve();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchStopSolving() {
        try {
            await SchedulerService.stopSolving();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchPlan() {
        try {
            // setIsLoading(true);
            const response = await SchedulerService.getPlan()
            setDownloadedPlan(response.data)
            setScore(SchedulerService.parseScoreString(response.data.score) || "-0hard/-0medium/-0soft")
            setSolverStatus(response.data.solverStatus)
        } catch (e) {
            console.error(e)
            setDownloadedPlan(null)
            setScore({hard: 0, medium: 0, soft: 0})
        }
    }

    async function fetchAnalyze() {
        try {
            const response = await SchedulerService.analyze()
            setAnalyzeObj(response.data)
        } catch (e) {
            console.error(e)
        }
    }

    async function exportExel() {
        try {
            const response = await SchedulerService.getExel();

            if (!response.data || response.data.size === 0) {
                throw new Error('Получен пустой файл');
            }

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            if (blob.size === 0) {
                throw new Error('Blob создан, но пуст');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'schedule_' + new Date().toISOString().split('T')[0] + '.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (solverStatus === "NOT_SOLVING") {
            setIsSolve(false)
        }
    }, [solverStatus])

    function displayByHardware() {
        setIsDisplayByHardware(true);
        setGroups(hardware);
        setItems(planByHardware);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }

    function displayByParty() {
        setIsDisplayByHardware(false);
        setGroups(party);
        setItems(planByParty);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }

    useEffect(() => {

        if (downloadedPlan) {

            ScheduleService.parseHardware(downloadedPlan).then((e) => {
                setHardware(e);
                if (isDisplayByHardware)
                    setGroups(e);
            });

            ScheduleService.parsePlanByHardware(downloadedPlan).then((e) => {
                setPlanByHardware(e);
                if (isDisplayByHardware)
                    setItems(e);
            });

            ScheduleService.parseParty(downloadedPlan).then((e) => {
                setParty(e);
                if (!isDisplayByHardware) {
                    setGroups(e);
                }
            });

            ScheduleService.parsePlanByParty(downloadedPlan).then((e) => {
                setPlanByParty(e);
                if (!isDisplayByHardware)
                    setItems(e);
            });
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }

    }, [downloadedPlan]);

    async function solve() {
        await fetchSolve();
        setIsSolve(true);
    }

    useEffect(() => {
        let intervalId;

        if (isSolve) {
            intervalId = setInterval(() => {
                fetchPlan();
            }, 2000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSolve]);

    async function stopSolving() {
        setIsSolve(false)
        await fetchStopSolving();
        await fetchPlan();
    }

    useEffect(() => {
        fetchLines();
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }, [])

    useEffect(() => {
        if (startTimeLines) {
            selectSettings()
            loadPday();
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }
    }, [startTimeLines])

    async function selectSettings() {
        await assignSettings(selectDate);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }

    const [selectedItem, setSelectedItem] = useState(null);

    // Добавленные функции для динамического формата
    const handleZoom = useCallback((timelineContext) => {
        setCurrentUnit(timelineContext.timelineUnit);
    }, []);

    const formatTimelineLabel = (date, unit, width, height) => {
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

        if ( unit === 'minute' ) {
            return momentDate.format('mm');
        }

        if (unit === 'hour') {
            if (width < 40) return momentDate.format('HH');
            return momentDate.format('HH:mm');
        }

        if (currentUnit === 'day') {
            if (width < 30) return momentDate.format('DD');
            if (width < 60) return momentDate.format('DD.MM');
            if (width < 120) return momentDate.format('dd DD.MM');
            return momentDate.format('dddd DD.MM');
        }

        if (currentUnit === 'month') {
            if (width < 80) return momentDate.format('MM');
            return momentDate.format('MMMM');
        }

        return momentDate.format('DD.MM HH:mm');
    };

    const formatTimelineLabelMain = (date, unit, width, height) => {
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

    //Обертка для исключения в библиотеке о передаче пропсов
    const originalConsoleError = console.error;
    useEffect(() => {
        // const originalError = console.error;
        //
        // console.error = (...args) => {
        //     const errorMessage = args[0];
        //
        //     // Все варианты ошибок про невалидные объекты
        //     const invalidObjectErrors = [
        //         'Objects are not valid as a React child',
        //         'found: object with keys',
        //         'If you meant to render a collection of children, use an array instead'
        //     ];
        //
        //     // Проверяем, нужно ли скрыть эту ошибку
        //     const shouldSuppress = invalidObjectErrors.some(errorText =>
        //         typeof errorMessage === 'string' && errorMessage.includes(errorText)
        //     );
        //
        //     if (shouldSuppress) {
        //         return; // Скрываем только эти ошибки
        //     }
        //
        //     // Все остальные ошибки (сети, JavaScript, etc.) показываем
        //     originalError.apply(console, args);
        // };
        //
        // return () => {
        //     console.error = originalError;
        // };
    }, []);

    function onChangeSelectDate(e) {
        const selectedDate = new Date(e);
        setSelectDate(e);
        setSelectDateTable(e)

        // Следующий день от выбранной даты
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        const dateString = nextDay.toISOString().split('T')[0];

        setSelectEndDate(dateString);
        setIdealEndDateTime(`${dateString}T02:00`);
        setMaxEndDateTime(`${dateString}T03:00`);
    }

    function onChangeEndDate(e) {
        setSelectEndDate(e);
        setIdealEndDateTime(new Date(e).toISOString().replace(/T.*/, 'T02:00'));
        setMaxEndDateTime(new Date(e).toISOString().replace(/T.*/, 'T03:00'));
    }

    // Позиция в своей группе (без учета cleaning элементов)
    const getGroupPosition = (itemId, allItems) => {
        const item = allItems.find(i => i.id === itemId)
        if (!item) return {position: -1, total: 0}

        // Исключаем cleaning элементы из группы
        const groupItems = allItems.filter(i =>
            i.group === item.group && !i.id.includes('cleaning')
        )

        const sorted = groupItems.sort((a, b) =>
            new Date(a.start_time) - new Date(b.start_time)
        )

        const position = sorted.findIndex(i => i.id === itemId) + 1
        return {
            position,
            total: sorted.length
        }
    }

    const handleItemRightClick = (itemId, e) => {
        e.preventDefault();

        if (itemId.includes('cleaning')) {
            return;
        }

        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;
        const clickedItem = itemsArray.find(item => item.id === itemId);

        // Проверяем, кликнули на уже выделенный элемент
        const isClickingSelected = selectedItems.includes(itemId);

        if (isClickingSelected && selectedItems.length > 1) {
            // Клик правой кнопкой на уже выделенный элемент при множественном выделении
            // НЕ меняем выделение, просто показываем контекстное меню для всех выделенных
            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                item: clickedItem,
                forCanvas: false,
                forMultiple: true, // Флаг что меню для нескольких элементов
                selectedItems: selectedItems // Передаем все выделенные ID
            });
        } else {
            // Клик на невыделенный элемент или одиночное выделение
            setSelectedItems([itemId]);
            setSelectedItem(clickedItem);
            setLastSelectedItem(clickedItem);

            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                item: clickedItem,
                forCanvas: false,
                forMultiple: false,
                selectedItems: [itemId]
            });
        }
    };

    const handleCanvasRightClick = (groupId, time, e) => {

        setSelectedItems([]);
        setSelectedItem(null);

        setLastSelectedItem(null);
            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                item: null,
                forCanvas: true,
                selectedItems:  []
            });
    };

    // Закрытие контекстного меню
    const closeContextMenu = useCallback(() => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            item: null,
            forCanvas: false
        })
    }, [])

    // Закрытие меню при клике вне его
    React.useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible === true) {
                closeContextMenu()
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [contextMenu.visible, closeContextMenu])

    async function pinItems() {
        try {
            const groupPos = getGroupPosition(selectedItem?.id, items).position
            await SchedulerService.pinItem(selectedItem.group, groupPos);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка прикрепления: " + e.message)
            setIsModalNotify(true);
        }
    }

    async function unpinLine() {
        try {
            await SchedulerService.pinItem(selectedItem.group, 0);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка открепления: " + e.message)
            setIsModalNotify(true);
        }
    }

    const [visibleTimeRange, setVisibleTimeRange] = useState(null);
    const timelineRef = useRef();

    const [timelineContext, setTimelineContext] = useState(null);

    const handleTimeChange = useCallback((visibleTimeStart, visibleTimeEnd, updateScrollCanvas, unit, timelineContext) => {
        setVisibleTimeRange({
            visibleTimeStart,
            visibleTimeEnd,
            updateScrollCanvas
        });

        // Сохраняем контекст timeline, который содержит текущий unit
        if (timelineContext) {
            setTimelineContext(timelineContext);
        }

        updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }, []);

    // Восстановление масштаба после обновления данных
    React.useEffect(() => {
        if (visibleTimeRange && visibleTimeRange.updateScrollCanvas) {
            // Небольшая задержка для гарантии, что DOM обновился
            setTimeout(() => {
                visibleTimeRange.updateScrollCanvas(
                    visibleTimeRange.visibleTimeStart,
                    visibleTimeRange.visibleTimeEnd
                );
            }, 100);
        }
    }, [downloadedPlan]);

    useEffect(() => {
        displayByHardware()
    }, [planByHardware])

    function onItemDoubleClick(itemId, e, time) {
        if (isDisplayByHardware) {
            setSelectedItem(planByHardware.find(item => item.id === itemId))
            setIsModalInfoItem(true)
        } else {
            setSelectedItem(planByParty.find(item => item.id === itemId))
            setIsModalInfoItem(true)
        }
    }

    function onItemSelect(itemId, e, time) {
        if (itemId.includes('cleaning')) {
            return;
        }
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;
        const clickedItem = itemsArray.find(item => item.id === itemId);

        if (e.shiftKey && lastSelectedItem) {
            // Shift+click - выделяем диапазон ТОЛЬКО в той же группе
            handleShiftSelect(itemId, itemsArray, clickedItem.group);
        } else {
            // Проверяем, кликаем на уже выделенный элемент
            const isClickingSelected = selectedItems.includes(itemId);

            if (isClickingSelected && selectedItems.length > 1) {
                // Клик на уже выделенный элемент при множественном выделении
                // НЕ меняем выделение, просто обновляем lastSelectedItem
                setLastSelectedItem(clickedItem);
            } else {
                // Клик на невыделенный элемент или одиночное выделение
                setSelectedItem(clickedItem);
                setSelectedItems([itemId]);
                setLastSelectedItem(clickedItem);
            }
        }
    }

    // Функция для выделения диапазона по Shift ТОЛЬКО в одной группе
    const handleShiftSelect = (itemId, itemsArray, groupId) => {
        const lastItem = lastSelectedItem;
        const currentItem = itemsArray.find(item => item.id === itemId);

        if (!lastItem || !currentItem) return;

        // Фильтруем элементы ТОЛЬКО из этой группы и исключаем cleaning
        const groupItems = itemsArray.filter(item =>
            item.group === groupId && !item.id.includes('cleaning')
        );

        // Остальной код без изменений...
        const sortedGroupItems = [...groupItems].sort((a, b) => a.start_time - b.start_time);

        const lastIndex = sortedGroupItems.findIndex(item => item.id === lastItem.id);
        const currentIndex = sortedGroupItems.findIndex(item => item.id === currentItem.id);

        if (lastIndex === -1 || currentIndex === -1) return;

        const startIndex = Math.min(lastIndex, currentIndex);
        const endIndex = Math.max(lastIndex, currentIndex);

        const rangeSelection = sortedGroupItems
            .slice(startIndex, endIndex + 1)
            .map(item => item.id);

        setSelectedItems(rangeSelection);
        setSelectedItem(currentItem);
        setLastSelectedItem(currentItem);
    };

    // Функция для сброса выделения при клике на пустую область
    const handleCanvasClick = useCallback((e) => {
        // Проверяем, что клик не на элементе timeline
        if (!e.target.closest('.rct-item') && !e.target.closest('.rct-group')) {
            setSelectedItems([]);
            setSelectedItem(null);
            setLastSelectedItem(null);
        }
    }, []);

    const [selectedItems, setSelectedItems] = useState([]);
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    async function moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex) {
        try {
            await SchedulerService.moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка перемещения job-ов: " + e.message)
            setIsModalNotify(true);
        }
    }

    async function assignServiceWork(toLineId, insertIndex, duration) {
        try {
            await SchedulerService.assignServiceWork(toLineId, insertIndex, duration);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения сервисной операции: " + e.message)
            setIsModalNotify(true);
        }
    }

    const customItemRenderer = ({item, itemContext, getItemProps}) => {
        const isSelected = selectedItems.includes(item.id);
        const isSingleSelected = selectedItem?.id === item.id;

        const itemProps = getItemProps({
            style: {
                background: isSelected ?
                    (isSingleSelected ? "#d0ff9a" : "#d0ff9a") :
                    item.itemProps?.style?.background,
                border: '1px solid #aeaeae',
                textAlign: 'start',
                color: item.itemProps.style.color || 'black',
                margin: 0,
                padding: '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
            },
            onMouseDown: getItemProps().onMouseDown,
            onTouchStart: getItemProps().onTouchStart
        });

        // Удаляем key из полученных пропсов
        const { key, ...safeItemProps } = itemProps;

        return (
            <>
                <div
                    key={item.id} // Явно передаем key
                    {...safeItemProps} // Распространяем пропсы БЕЗ key
                    className="rct-item"
                >
                    <div className="flex px-1 justify-between font-medium text-sm text-black">
                        {item.info?.pinned &&
                            <>
                                {isSelected && selectedItems.length > 1 && (
                                    <div className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                        {selectedItems.indexOf(item.id) + 1}
                                    </div>
                                )}
                                <div className="h-2 absolute p-0"><i className="text-red-800 p-0 m-0 fa-solid fa-thumbtack"></i></div>
                                <span className="ml-4">{item.title}</span>
                            </>
                        }

                        {!item.info?.pinned &&
                            <>
                                {isSelected && selectedItems.length > 1 && (
                                    <div className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                        {selectedItems.indexOf(item.id) + 1}
                                    </div>
                                )}
                                <span className="">{item.title}</span>
                            </>
                        }
                    </div>
                    <div className="flex flex-col justify-start text-xs">
                        {item.info?.np &&
                            <span className=" px-1 rounded"><span className="text-blue-500">{item.info.np}</span>  № партии</span>
                        }
                        {item.info?.duration &&
                            <span className=" px-1 rounded"><span className="text-pink-500">{item.info.duration} мин. </span> <span className="text-green-600">{moment(item.start_time).format('HH:mm')} </span>
                        - <span className="text-red-500">{moment(item.end_time).format('HH:mm')}</span>  Время</span>
                        }
                        {item.info?.groupIndex &&
                            <span className=" px-1 rounded">
                            <span className="text-violet-600">{item.info?.groupIndex}</span>  Позиция на линии
                        </span>
                        }
                    </div>
                </div>
            </>
        );
    };

    const customGroupRenderer = ({group}) => {

        return (
            <div
                className="custom-group-renderer"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '4px 8px'
                }}
            >
                <div className="group-title font-semibold text-sm mb-1">
                    {group.title}
                </div>

                <div className="group-stats text-xs text-gray-500">
                    Количество: {group.totalQuantity}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="w-full">

                {isModalInfoItem && selectedItem && <ModalInfoItem info={selectedItem.info} onClose={() => {
                    setSelectedItem(null);
                    setIsModalInfoItem(false)
                }}/>}

                {isLoading &&
                    <div className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center ">Загрузка</div>
                }

                <div className="flex flex-row">
                    <div className="w-1/3 ">
                        <button onClick={() => {
                            navigate(from, {replace: true})
                        }} className=" ml-4 mt-6 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
                        </button>
                    </div>

                    <h1 className="w-1/3 font-bold text-center text-2xl mb-8 mt-6">Планировщик задач</h1>
                    <div className="w-1/3 mt-6 py-1 flex justify-end pr-3">
                        <button onClick={savePlan}
                                className="h-[30px] px-2 mx-2 rounded border border-slate-400 hover:bg-gray-200">
                            Сохранить
                            <i className="pl-2 fa-solid fa-floppy-disk"></i>
                        </button>
                        <button onClick={clickRemovePlan}
                                className="h-[30px] px-2 mx-2 rounded border border-slate-400 hover:bg-gray-200">
                            Удалить
                            <i className="pl-2 fa-solid fa-trash-can"></i>
                        </button>
                        <button onClick={exportExel}
                                className="h-[30px] px-2 mx-2 rounded border border-slate-400 hover:bg-gray-200">
                            Excel экспорт
                            <i className="pl-2 fa-solid fa-file-excel"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-row justify-between my-4 px-4 ">

                    <div>
                        <div className="inline-flex px-2 h-[32px] items-center border rounded-md">
                            <span className="py-1 font-medium text-nowrap">📅 Дата:</span>
                            <input className={"px-2 font-medium w-32"} type="date"
                                   value={selectDate}
                                   onChange={(e) => onChangeSelectDate(e.target.value)}
                            />
                        </div>

                        <button className="ml-3 rounded bg-blue-800 text-white px-1 h-[30px] w-24"
                                onClick={selectSettings}>
                            Загрузить
                        </button>

                        <button onClick={() => {
                            setIsModalDateSettings(true)
                        }}
                                className={"ml-3 rounded bg-blue-800 hover:bg-blue-700 text-white px-2 h-[30px]"}>
                            Настройка линий
                        </button>
                    </div>

                    <div className="flex flex-row" style={{zIndex: 20}}>

                        {!isSolve &&
                            <div onClick={solve}>
                                <button
                                    className="rounded text-white px-1 bg-green-600 hover:bg-green-500 h-[30px] w-36">
                                    <i className="fa-solid fa-play"></i>
                                    <span className="pl-1">Планировать</span>
                                </button>
                            </div>
                        }
                        {isSolve &&
                            <div onClick={stopSolving}>
                                <button
                                    className="rounded text-white px-1 bg-red-600 hover:bg-red-500 h-[30px] w-36">
                                    <i className="fa-solid fa-stop"></i>
                                    <span className="pl-1">Остановить</span>
                                </button>
                            </div>
                        }

                        <div className="flex items-center border rounded-md ml-2 ">
                            <div
                                className="font-medium flex flex-row justify-between px-2 text-md text-gray-700 w-96 h-[30px]">
                                <div className="flex flex-col text-center w-1/3">
                                    <span className="px-1 mt-[-3px]">{score.hard}</span>
                                    <span className="text-xs mt-[-6px]">Ошибки</span>
                                </div>
                                <span className="text-lg">|</span>
                                <div className="flex flex-col text-center w-1/3">
                                    <span className="px-1 mt-[-3px]">{score.medium}</span>
                                    <span className="text-xs my-1 mt-[-6px]">Время простоя</span>
                                </div>
                                <span className="text-lg">|</span>
                                <div className="flex flex-col text-center w-1/3">
                                    <span className="px-1 mt-[-3px]">{score.soft}</span>
                                    <span className="text-xs my-1 mt-[-6px]">Время выполнения</span>
                                </div>
                            </div>
                            <button onClick={() => {
                                fetchAnalyze();
                                setIsModalAnalyze(true);
                            }}
                                    className={" h-full rounded-r px-2 bg-blue-800 hover:bg-blue-700 text-white"}>
                                Подробнее
                            </button>
                        </div>

                    </div>

                    <div className="">
                        <button onClick={displayByParty}
                                className={"border h-[30px] border-r-0 rounded-l-md px-2 " + stylePartyBut}>По
                            партиям
                        </button>
                        <button onClick={displayByHardware}
                                className={"border h-[30px] rounded-r-md px-2 " + styleHardwareBut}>По
                            оборудованию
                        </button>
                    </div>

                </div>

                <div className="m-4 border-x-2">
                    <Timeline
                        itemRenderer={customItemRenderer}
                        groupRenderer={customGroupRenderer}
                        key={timelineKey}
                        groups={groups}
                        items={items}
                        onItemDoubleClick={onItemDoubleClick}
                        onItemContextMenu={handleItemRightClick}
                        onItemSelect={onItemSelect}

                        onCanvasContextMenu={handleCanvasRightClick}

                        ref={timelineRef}
                        onTimeChange={handleTimeChange}
                        onZoom={handleZoom}
                        defaultTimeStart={visibleTimeRange?.visibleTimeStart || new Date().getTime() - (24 * 60 * 60 * 1000)}
                        defaultTimeEnd={visibleTimeRange?.visibleTimeEnd || new Date().getTime() + (24 * 60 * 60 * 1000)}
                        canMove={true}
                        snap={1}
                        snapGrid={1}
                        sidebarWidth={150}
                        lineHeight={90}
                    >
                        <TimelineHeaders className="sticky">
                            <SidebarHeader>
                                {({ getRootProps }) => (
                                    <div {...getRootProps()} className="bg-blue-800">
                                        {/* Заголовок сайдбара */}
                                    </div>
                                )}
                            </SidebarHeader>

                            {/* Основной заголовок с датой */}
                            <DateHeader
                                unit="primaryHeader"
                                className="bg-blue-800 font-semibold text-sm "
                                labelFormat={formatTimelineLabelMain}
                            />

                            {/* Динамический заголовок - меняет формат в зависимости от масштаба */}
                            <DateHeader
                                unit={currentUnit}
                                className=" font-medium text-sm "
                                labelFormat={formatTimelineLabel}
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    height: 30
                                }}
                            />
                        </TimelineHeaders>
                    </Timeline>
                </div>

                {isModalDateSettings && <ModalDateSettings onClose={() => {
                    setIsModalDateSettings(false)
                }}
                                                           selectEndDate={selectEndDate}
                                                           setSelectEndDate={onChangeEndDate}
                                                           lines={startTimeLines} setLines={setStartTimeLines}
                                                           idealEndDateTime={idealEndDateTime}
                                                           setIdealEndDateTime={setIdealEndDateTime}
                                                           maxEndDateTime={maxEndDateTime}
                                                           setMaxEndDateTime={setMaxEndDateTime}
                />}

                {isModalAnalyze && <ModalAnalyze onClose={() => setIsModalAnalyze(false)}
                                                 analyzeObj={analyzeObj}
                />}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}

                {isModalRemove &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setIsModalRemove(false)}
                                       onAgree={() => {
                                           setIsModalRemove(false);
                                           removePlan();
                                       }} onDisagree={() => setIsModalRemove(false)}/>}

                {contextMenu.visible && <DropDownActionsItem contextMenu={contextMenu} pin={pinItems} unpin={unpinLine}
                                                             isDisplayByHardware={isDisplayByHardware}
                                                             openModalMoveJobs={() => setIsModalMoveJobs(true)}
                                                             openModalAssignSettings={()=> setIsModalAssignServiceWork(true)}/>}

                {isModalMoveJobs &&
                    <ModalMoveJobs selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                   moveJobs={moveJobs} onClose={() => setIsModalMoveJobs(false)}
                                   lines={startTimeLines} planByParty={planByParty} planByHardware={planByHardware}
                    />}

                {isModalAssignServiceWork &&
                    <ModalAssignServiceWork selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                   assignServiceWork={assignServiceWork} onClose={() => setIsModalAssignServiceWork(false)}
                                   lines={startTimeLines} planByParty={planByParty} planByHardware={planByHardware}
                    />}

                <DataTable data={pdayData} setData={setPdayData} updatePday={updatePday} selectDate={selectDateTable}
                           dateData={selectDate}/>

                <div className="px-3 py-2 rounded flex flex-row justify-between align-middle text-black mb-2">
                    <div style={{fontSize: '16px'}}>
                        <button
                            className="mr-6 bg-blue-800 text-white px-3 py-1 "
                            onClick={loadPdayNextDay}
                            style={{
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Подгрузить следующий день
                        </button>
                    </div>
                </div>

                {pdayDataNextDay.length !== 0 &&
                    <DataTable data={pdayDataNextDay} setData={setPdayDataNextDay} updatePday={updatePday}
                               selectDate={selectDate} dateData={getNextDateStr(selectDateTable)}/>
                }

            </div>
        </>
    )
}

export default observer(SchedulerPage)