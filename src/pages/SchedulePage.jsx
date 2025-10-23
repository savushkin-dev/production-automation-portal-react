import "./../App.css";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import moment from 'moment'
import {Timeline} from "react-calendar-timeline";
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

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalRemove, setIsModalRemove] = useState(false);
    const [isModalInfoItem, setIsModalInfoItem] = useState(false);
    const [isModalMoveJobs, setIsModalMoveJobs] = useState(false);

    const [isSolve, setIsSolve] = useState(false);
    const [score, setScore] = useState("-0hard/-0medium/-0soft");
    const [solverStatus, setSolverStatus] = useState("");

    const [isModalDateSettings, setIsModalDateSettings] = useState(false);
    const [isModalAnalyze, setIsModalAnalyze] = useState(false);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [analyzeObj, setAnalyzeObj] = useState(null);

    const [selectDate, setSelectDate] = useState(new Date(new Date().setDate(new Date().getDate() - 0)).toISOString().split('T')[0])
    const [selectEndDate, setSelectEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])

    const [idealEndDateTime, setIdealEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T02:00'));
    const [maxEndDateTime, setMaxEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T03:00'));


    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        item: null
    })

    const [startTimeLines, setStartTimeLines] = useState(undefined);


    const [timelineKey, setTimelineKey] = useState(0);


    async function assignSettings() {

        await stopSolving();

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
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg(e.response.data.error)
            setIsModalNotify(true);

            setItems([])
            setScore("-0hard/-0medium/-0soft")
        }
    }

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
            setScore(response.data.score || "-0hard/-0medium/-0soft")
            setSolverStatus(response.data.solverStatus)
        } catch (e) {
            console.error(e)
            setDownloadedPlan(null)
            setScore("-0hard/-0medium/-0soft")
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
            if (intervalId) clearInterval(intervalId); // Очистка при размонтировании или изменении isSolve
        };
    }, [isSolve]); // Зависимость от isSolve


    async function stopSolving() {
        setIsSolve(false)
        await fetchStopSolving();
        await fetchPlan();
    }

    // useEffect(() => {
    //     fetchLines();
    //     assignSettings(selectDate);
    //     setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    // }, [selectDate])

    useEffect(() => {
        fetchLines();
        // assignSettings(selectDate);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }, [])

    useEffect(() => {
        if (startTimeLines) {
            // console.log("true")
            selectSettings()
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }

    }, [startTimeLines])

    async function selectSettings() {
        // fetchLines();
        await assignSettings(selectDate);
        // await fetchPlan();
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }


    const [selectedItem, setSelectedItem] = useState(null);

    function onItemSelect(itemId, e, time) {
        if (isDisplayByHardware) {
            setSelectedItem(planByHardware.find(item => item.id === itemId))

            setIsModalInfoItem(true)
        } else {
            setSelectedItem(planByParty.find(item => item.id === itemId))
            setIsModalInfoItem(true)
        }
    }

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


    // const handleItemSelect = (itemId, e, time) => {
    //     console.log('Выбран элемент:', itemId)
    //     // Здесь можно найти полный объект элемента по ID
    // }

    const handleGroupSelect = (groupId, e) => {
        console.log('Выбрана группа:', groupId)
    }

    // Позиция в общей временной линии
    const getGlobalPosition = (itemId, allItems) => {
        const sorted = [...allItems].sort((a, b) =>
            new Date(a.start_time) - new Date(b.start_time)
        )
        const index = sorted.findIndex(item => item.id === itemId)
        return index >= 0 ? index + 1 : -1
    }

    // Позиция в своей группе
    const getGroupPosition = (itemId, allItems) => {
        const item = allItems.find(i => i.id === itemId)
        if (!item) return {position: -1, total: 0}

        const groupItems = allItems.filter(i => i.group === item.group)
        const sorted = groupItems.sort((a, b) =>
            new Date(a.start_time) - new Date(b.start_time)
        )

        const position = sorted.findIndex(i => i.id === itemId) + 1
        return {
            position,
            total: sorted.length
        }
    }

    // Все элементы, которые пересекаются по времени
    const getConcurrentItems = (itemId, allItems) => {
        const selected = allItems.find(i => i.id === itemId)
        if (!selected) return []

        return allItems.filter(item =>
            item.id !== itemId && // исключаем сам элемент
            new Date(item.start_time) < new Date(selected.end_time) &&
            new Date(item.end_time) > new Date(selected.start_time)
        )
    }

    function handleItemSelect(itemId, e) {
        const item = items.find(i => i.id === itemId)
        setSelectedItem(item)

        console.log(item)
        console.log(itemId)
        const globalPos = getGlobalPosition(itemId, items)
        const groupPos = getGroupPosition(itemId, items)
        const concurrentItems = getConcurrentItems(itemId, items)

        console.log('=== ИНФОРМАЦИЯ О ПОЗИЦИИ ===')
        console.log(`Элемент: "${item.title}"`)
        console.log(`Общая позиция в timeline: ${globalPos} из ${items.length}`)
        console.log(`Позиция в группе: ${groupPos.position} из ${groupPos.total}`)
        console.log(`Одновременно выполняется задач: ${concurrentItems.length}`)
        console.log('============================')

        console.log(startTimeLines)
        console.log(item.group)
    }

    const handleItemDeselect = useCallback(() => {
        setSelectedItem(null)
    }, [])

    // Обработчик правой кнопки мыши
    function handleItemRightClick(itemId, e) {
        console.log("handleItemRightClick")

        const item = items.find(i => i.id === itemId)
        setSelectedItem(item)

        e.preventDefault() // Предотвращаем стандартное контекстное меню браузера


        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item: item
        })

        console.log('Правый клик по элементу:', item)
    }


    // Закрытие контекстного меню
    const closeContextMenu = useCallback(() => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            item: null
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
            // console.log(items)
            // console.log(selectedItem)
            const groupPos = getGroupPosition(selectedItem?.id, items).position
            await SchedulerService.pinItem(selectedItem.group, groupPos);
            // setTimeout(()=> {
            //     fetchPlan()
            // }, 100)
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

    // Сохраняем текущий видимый диапазон
    const handleTimeChange = useCallback((visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
        setVisibleTimeRange({
            visibleTimeStart,
            visibleTimeEnd,
            updateScrollCanvas
        });

        // Немедленно обновляем canvas
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


    const handleItemMove = (itemId, dragTime, newGroupOrder) => {
        const newGroupId = groups[newGroupOrder].id;

        if (isDisplayByHardware) {
            setPlanByHardware(prev => prev.map(item =>
                item.id === itemId
                    ? {
                        ...item,
                        start_time: new Date(dragTime),
                        end_time: new Date(dragTime + (item.end_time - item.start_time)),
                        group: newGroupId
                    }
                    : item
            ));
        } else {
            setPlanByParty(prev => prev.map(item =>
                item.id === itemId
                    ? {
                        ...item,
                        start_time: new Date(dragTime),
                        end_time: new Date(dragTime + (item.end_time - item.start_time)),
                        group: newGroupId
                    }
                    : item
            ));
        }

        console.log("Moved", itemId, new Date(dragTime), newGroupOrder);
    };

    useEffect(()=>{
        displayByHardware()
    },[planByHardware])



    const insertItemWithShift = (newItem, targetGroupId, targetTime, originalItem = null) => {
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;

        // 1. Обрабатываем место ВСТАВКИ (целевая группа)
        const targetGroupItems = itemsArray
            .filter(item => item.group === targetGroupId && item.id !== newItem.id)
            .sort((a, b) => a.start_time - b.start_time);

        // Время окончания нового элемента
        const newItemEnd = targetTime + (newItem.end_time - newItem.start_time);

        // Находим ВСЕ элементы, которые пересекаются с новым элементом или находятся после
        const itemsToShiftInTarget = targetGroupItems.filter(item =>
            item.start_time >= targetTime || // Все элементы после точки вставки
            (item.start_time < targetTime && item.end_time > targetTime) // Элементы, которые пересекаются с новым
        );

        console.log(itemsToShiftInTarget)
        console.log('Элементы для сдвига в целевой группе:', itemsToShiftInTarget.map(item => ({
            id: item.id,
            start: new Date(item.start_time),
            end: new Date(item.end_time)
        })));

        // 2. Обрабатываем место ИСХОДНОЕ (если элемент перемещается между группами)
        let itemsToShiftInSource = [];
        if (originalItem && originalItem.group !== targetGroupId) {
            const sourceGroupItems = itemsArray
                .filter(item => item.group === originalItem.group && item.id !== newItem.id)
                .sort((a, b) => a.start_time - b.start_time);

            // Находим элементы после исходного элемента
            itemsToShiftInSource = sourceGroupItems.filter(item => item.start_time >= originalItem.start_time);
        }



        // Создаем обновленный массив элементов
        const updatedItems = itemsArray.map(item => {
            // 1. Обновляем перемещаемый элемент
            if (item.id === newItem.id) {
                return {
                    ...item,
                    start_time: targetTime,
                    end_time: newItemEnd,
                    group: targetGroupId
                };
            }

            // 2. Сдвигаем элементы в ЦЕЛЕВОЙ группе (вперед)
            if (itemsToShiftInTarget.some(shiftItem => shiftItem.id === item.id)) {
                const shiftAmount = newItem.end_time - newItem.start_time;
                return {
                    ...item,
                    start_time: item.start_time + shiftAmount,
                    end_time: item.end_time + shiftAmount
                };
            }

            // 3. Сдвигаем элементы в ИСХОДНОЙ группе (назад, чтобы закрыть пробел)
            if (originalItem && itemsToShiftInSource.some(shiftItem => shiftItem.id === item.id)) {
                const shiftAmount = originalItem.end_time - originalItem.start_time;
                return {
                    ...item,
                    start_time: item.start_time - shiftAmount,
                    end_time: item.end_time - shiftAmount
                };
            }

            return item;
        });

        // Обновляем состояние
        if (isDisplayByHardware) {
            setPlanByHardware(updatedItems);
        } else {
            setPlanByParty(updatedItems);
        }
    };

    const insertBetweenItems = (newItem, targetGroupId, beforeItemId, afterItemId, originalItem = null) => {
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;

        const beforeItem = itemsArray.find(item => item.id === beforeItemId);
        const afterItem = itemsArray.find(item => item.id === afterItemId);

//разобраться при вставке между, остальное вроде работает корректно
        console.log(beforeItem)
        console.log(afterItem)

        if (!beforeItem || !afterItem) return;

        // Время вставки (сразу после beforeItem)
        const insertTime = beforeItem.end_time;
        const newItemDuration = newItem.end_time - newItem.start_time;
        const newItemEnd = insertTime + newItemDuration;





            // Находим ВСЕ элементы для сдвига в целевой группе (включая afterItem)
            const itemsToShiftInTarget = itemsArray
                .filter(item => item.group === targetGroupId &&
                    item.id !== newItem.id &&
                    // item.start_time >= afterItem.start_time)
                    item.start_time >= beforeItem.end_time)
                .sort((a, b) => a.start_time - b.start_time);
//Неучитывается объект которого заменяют!!!!
            console.log('Элементы для сдвига при вставке между:', itemsToShiftInTarget.map(item => ({
                id: item.id,
                start: new Date(item.start_time+newItemDuration),
                end: new Date(item.end_time+newItemDuration)
            })));
console.log(itemsToShiftInTarget)
            // Обрабатываем ИСХОДНУЮ группу
            let itemsToShiftInSource = [];
            if (originalItem && originalItem.group !== targetGroupId) {
                const sourceGroupItems = itemsArray
                    .filter(item => item.group === originalItem.group && item.id !== newItem.id)
                    .sort((a, b) => a.start_time - b.start_time);
//Нужно правильно отфильтровать массив, ибо пока для сдвига доступны только правые элементы от места вставки (и то вроде не сдвигаются),
// до вставки надо сдвинуть влево наоборот
                itemsToShiftInSource = sourceGroupItems.filter(item => item.start_time >= originalItem.start_time);
            }

            const shiftAmount = newItemDuration;
let removeTime = 0;

            const updatedItems = itemsArray.map(item => {
                // Новый элемент
                if (item.id === newItem.id) {
                    return {
                        ...item,
                        start_time: insertTime,
                        end_time: newItemEnd,
                        group: targetGroupId
                    };
                }

                // console.log(newItem.end_time)
                // console.log(item.start_time)

                if(newItem.end_time === item.start_time && newItem.group === beforeItem.group){
                    console.log("Та же линия")
                    removeTime = -(newItemDuration);

                } //Сделал если двигать с право на лево на той же линии, надо сделать еще в другую сторону

                // Сдвигаем элементы в ЦЕЛЕВОЙ группе ВПЕРЕД (включая afterItem)
                if (itemsToShiftInTarget.some(shiftItem => shiftItem.id === item.id)) {
                    return {
                        ...item,
                        start_time: item.start_time + shiftAmount + removeTime,
                        end_time: item.end_time + shiftAmount  + removeTime
                    };
                }

                // Сдвигаем элементы в ИСХОДНОЙ группе НАЗАД
                if (originalItem && itemsToShiftInSource.some(shiftItem => shiftItem.id === item.id)) {
                    const sourceShiftAmount = originalItem.end_time - originalItem.start_time;
                    return {
                        ...item,
                        start_time: item.start_time - sourceShiftAmount,
                        end_time: item.end_time - sourceShiftAmount
                    };
                }

                return item;
            });

            if (isDisplayByHardware) {
                setPlanByHardware(updatedItems);
            } else {
                setPlanByParty(updatedItems);
            }

    };

    const handleItemMoveWithSmartPlacement = (itemId, dragTime, newGroupOrder) => {
        const newGroupId = groups[newGroupOrder].id;
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;
        const movedItem = itemsArray.find(item => item.id === itemId);

        if (!movedItem) return;

        console.log('=== НАЧАЛО ПЕРЕМЕЩЕНИЯ ===');
        console.log('Перемещаемый элемент:', {
            id: movedItem.id,
            start: new Date(movedItem.start_time),
            end: new Date(movedItem.end_time),
            group: movedItem.group
        });

        const groupItems = itemsArray
            .filter(item => item.group === newGroupId && item.id !== itemId)
            .sort((a, b) => a.start_time - b.start_time);

        console.log('Элементы в целевой группе:', groupItems.map(item => ({
            id: item.id,
            start: new Date(item.start_time),
            end: new Date(item.end_time)
        })));

        // Сохраняем исходные данные элемента ДО перемещения
        const originalItem = {
            ...movedItem,
            start_time: movedItem.start_time,
            end_time: movedItem.end_time,
            group: movedItem.group
        };

        // Находим ближайшие элементы
        const beforeItem = groupItems.filter(item => item.end_time <= dragTime).pop();
        const afterItem = groupItems.find(item => item.start_time >= dragTime);

        console.log('Найденные элементы для вставки:', {
            beforeItem: beforeItem ? { id: beforeItem.id, end: new Date(beforeItem.end_time) } : null,
            afterItem: afterItem ? { id: afterItem.id, start: new Date(afterItem.start_time) } : null
        });

        if (beforeItem && afterItem) {
            console.log('Вставка МЕЖДУ элементами');
            insertBetweenItems(movedItem, newGroupId, beforeItem.id, afterItem.id, originalItem);
        } else if (beforeItem) {
            console.log('Вставка ПОСЛЕ элемента');
            insertItemWithShift(movedItem, newGroupId, beforeItem.end_time, originalItem);
        } else if (afterItem) {
            console.log('Вставка ПЕРЕД элементом');
            // Вставляем перед afterItem, но не перекрывая его
            const maxInsertTime = afterItem.start_time - (movedItem.end_time - movedItem.start_time);
            const insertTime = Math.min(dragTime, maxInsertTime);
            insertItemWithShift(movedItem, newGroupId, insertTime, originalItem);
        } else {
            console.log('Группа ПУСТАЯ');
            insertItemWithShift(movedItem, newGroupId, dragTime, originalItem);
        }
    };


    function onItemSelect(itemId, e, time) {
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;
        const clickedItem = itemsArray.find(item => item.id === itemId);

        if (e.shiftKey && lastSelectedItem) {
            // Shift+click - выделяем диапазон ТОЛЬКО в той же группе
            handleShiftSelect(itemId, itemsArray, clickedItem.group);
        }
            // else if (e.ctrlKey || e.metaKey) {
            //     // Ctrl+click - добавляем/убираем из выделения
            //     setSelectedItems(prev => {
            //         const newSelection = prev.includes(itemId)
            //             ? prev.filter(id => id !== itemId)
            //             : [...prev, itemId];
            //
            //         setSelectedItem(clickedItem);
            //         setLastSelectedItem(clickedItem);
            //         return newSelection;
            //     });
        // }
        else {
            // Обычный клик - выделяем один элемент
            setSelectedItem(clickedItem);
            setSelectedItems([itemId]);
            setLastSelectedItem(clickedItem);
        }

        // setIsModalInfoItem(true);
    }

// Функция для выделения диапазона по Shift ТОЛЬКО в одной группе
    const handleShiftSelect = (itemId, itemsArray, groupId) => {
        const lastItem = lastSelectedItem;
        const currentItem = itemsArray.find(item => item.id === itemId);

        if (!lastItem || !currentItem) return;

        // Фильтруем элементы ТОЛЬКО из этой группы
        const groupItems = itemsArray.filter(item => item.group === groupId);

        // Сортируем элементы группы по времени начала
        const sortedGroupItems = [...groupItems].sort((a, b) => a.start_time - b.start_time);

        // Находим индексы последнего и текущего элементов В ГРУППЕ
        const lastIndex = sortedGroupItems.findIndex(item => item.id === lastItem.id);
        const currentIndex = sortedGroupItems.findIndex(item => item.id === currentItem.id);

        if (lastIndex === -1 || currentIndex === -1) return;

        // Определяем начало и конец диапазона
        const startIndex = Math.min(lastIndex, currentIndex);
        const endIndex = Math.max(lastIndex, currentIndex);

        // Получаем IDs всех элементов в диапазоне ТОЛЬКО из этой группы
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


    // Добавляем состояния
    const [selectedItems, setSelectedItems] = useState([]);
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    // function move() {
    //     console.log('Выделенные элементы:', selectedItems);
    //
    //     const itemsArray = isDisplayByHardware ? planByHardware : planByParty;
    //
    //     if (selectedItems.length === 0) {
    //         console.log('Нет выделенных элементов');
    //         return null;
    //     }
    //
    //     // Получаем массив выделенных объектов
    //     const selectedItemsArray = itemsArray.filter(item => selectedItems.includes(item.id));
    //
    //     // Получаем группу (должна быть одна)
    //     const groupId = selectedItemsArray[0].group;
    //
    //     // Проверяем, что все элементы в одной группе
    //     const allSameGroup = selectedItemsArray.every(item => item.group === groupId);
    //
    //     if (!allSameGroup) {
    //         console.warn('Элементы в разных группах! Это не должно происходить');
    //         return null;
    //     }
    //
    //     // Получаем все элементы группы и сортируем
    //     const groupItems = itemsArray
    //         .filter(item => item.group === groupId)
    //         .sort((a, b) => a.start_time - b.start_time);
    //
    //     // Сортируем выделенные элементы по времени
    //     const sortedSelected = selectedItemsArray
    //         .sort((a, b) => a.start_time - b.start_time);
    //
    //     const firstItem = sortedSelected[0];
    //     const lastItem = sortedSelected[sortedSelected.length - 1];
    //
    //     // Находим позиции в группе
    //     const firstItemIndex = groupItems.findIndex(item => item.id === firstItem.id);
    //     const lastItemIndex = groupItems.findIndex(item => item.id === lastItem.id);
    //
    //     const result = {
    //         groupId: groupId,
    //         selectedCount: selectedItemsArray.length,
    //         firstItem: {
    //             id: firstItem.id,
    //             position: firstItemIndex + 1, // Позиция в группе (начиная с 1)
    //             start_time: firstItem.start_time,
    //             end_time: firstItem.end_time,
    //             index: firstItemIndex // Индекс в массиве (начиная с 0)
    //         },
    //         lastItem: {
    //             id: lastItem.id,
    //             position: lastItemIndex + 1, // Позиция в группе (начиная с 1)
    //             start_time: lastItem.start_time,
    //             end_time: lastItem.end_time,
    //             index: lastItemIndex // Индекс в массиве (начиная с 0)
    //         },
    //         positionRange: {
    //             start: firstItemIndex + 1, // Позиция первого (начиная с 1)
    //             end: lastItemIndex + 1,    // Позиция последнего (начиная с 1)
    //             startIndex: firstItemIndex, // Индекс первого (начиная с 0)
    //             endIndex: lastItemIndex     // Индекс последнего (начиная с 0)
    //         },
    //         allSelectedItems: sortedSelected.map(item => ({
    //             id: item.id,
    //             position: groupItems.findIndex(groupItem => groupItem.id === item.id) + 1,
    //             start_time: item.start_time,
    //             end_time: item.end_time
    //         }))
    //     };
    //
    //     console.log('Информация для перемещения:');
    //     console.log(`Группа: ${result.groupId}`);
    //     console.log(`Количество элементов: ${result.selectedCount}`);
    //     console.log(`Позиции: с ${result.positionRange.start} по ${result.positionRange.end}`);
    //     console.log(`Первый элемент: ${result.firstItem.id} (позиция ${result.firstItem.position})`);
    //     console.log(`Последний элемент: ${result.lastItem.id} (позиция ${result.lastItem.position})`);
    //
    //
    //     moveJobs(groupId, "170610100000", firstItemIndex, selectedItemsArray.length, 2)
    //
    //     return result;
    // }

    async function moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex) {
        try {
            await SchedulerService.moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex);
            await fetchPlan();
            // setMsg("Job-ы успешно перемещены.")
            // setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка перемещения job-ов: " + e.message)
            setIsModalNotify(true);
        }
    }


    const customItemRenderer = ({item, itemContext, getItemProps}) => {  //кастомный item

        const isSelected = selectedItems.includes(item.id);
        const isSingleSelected = selectedItem?.id === item.id;

        return (
            <>
                <div
                    key={item.id} // Ключ передаётся напрямую
                    {...getItemProps({
                        style: {
                            // background: itemContext.selected ? "#d0ff9a" : item.itemProps.style.background,
                            background: isSelected ?
                                (isSingleSelected ? "#d0ff9a" : "#d0ff9a") :
                                item.itemProps?.style?.background,
                            border: '1px solid #aeaeae',
                            // border: isSelected ?
                            //     (isSingleSelected ? "2px solid #4CAF50" : "2px solid #2196F3") :
                            //     '1px solid #aeaeae',
                            textAlign: 'start',
                            color: item.itemProps.style.color || 'black',
                            margin: 0,
                            padding: '0',

                            whiteSpace: 'nowrap',      /* Запрет переноса строк */
                            overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                            textOverflow: 'ellipsis',   /* Добавление "..." */
                            maxWidth: '100%',           /* Ограничение ширины */

                        },
                        onMouseDown: getItemProps().onMouseDown,
                        onTouchStart: getItemProps().onTouchStart
                    })}
                    className="rct-item"
                >

                    {/*/!* Индикатор множественного выделения *!/*/}
                    {/*{isSelected && selectedItems.length > 1 && (*/}
                    {/*    <div className="absolute top-1 left-1 z-10 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">*/}
                    {/*        {selectedItems.indexOf(item.id) + 1}*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/*<div className={`flex px-1 justify-between font-medium text-sm text-black ${*/}
                    {/*    isSelected && selectedItems.length > 1 ? 'pl-5' : ''*/}
                    {/*}`}>*/}
                    {/*    {item.title}*/}
                    {/*</div>*/}

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
                                    <div
                                        className="absolute top-1 left-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                        {selectedItems.indexOf(item.id) + 1}
                                    </div>
                                )}
                                <span className="">{item.title}</span>
                            </>

                        }
                    </div>
                    <div className="flex flex-col justify-start text-xs">
                        {item.info?.np &&
                            <span className=" px-1 rounded">№ партии: <span
                                className="text-blue-500">{item.info.np}</span></span>
                        }
                        {item.info?.duration &&
                            <span className=" px-1 rounded">Длительность: <span
                                className="text-pink-500">{item.info.duration} мин.</span></span>
                        }
                        <span className=" px-1 rounded">
                     Время: <span className="text-green-600">{moment(item.start_time).format('HH:mm')} </span>
                    - <span className="text-red-500">{moment(item.end_time).format('HH:mm')}</span>
                </span>

                    </div>


                </div>
            </>
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

                <button onClick={() => {
                    navigate(from, {replace: true})
                }} className="absolute ml-4 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
                </button>

                <h1 className="font-bold text-center text-2xl mb-8 mt-6">Планировщик задач</h1>

                <div className="flex flex-row justify-between my-4 px-4 ">
                    <div className="">
                        <button onClick={displayByParty}
                                className={"border h-[30px] border-gray-300 border-r-0 rounded-l-md px-2 shadow-inner" + stylePartyBut}>По
                            партиям
                        </button>
                        <button onClick={displayByHardware}
                                className={"border h-[30px] border-gray-300 rounded-r-md px-2 shadow-inner" + styleHardwareBut}>По
                            оборудованию
                        </button>
                    </div>


                    <div className="w-auto flex flex-row" style={{position: "relative", zIndex: 20}}>


                        {!isSolve &&
                            <div onClick={solve}>
                                <button
                                    className="border h-[30px] w-32 border-gray-300 rounded-md text-white px-1 bg-green-600 hover:bg-green-500">
                                    <i className="fa-solid fa-play"></i>
                                    <span className="pl-1">Решать</span>
                                </button>
                            </div>
                        }
                        {isSolve &&
                            <div onClick={stopSolving}>
                                <button
                                    className="border h-[30px] w-32 border-gray-300 rounded-md text-white px-1 bg-red-600 hover:bg-red-500">
                                    <i className="fa-solid fa-stop"></i>
                                    <span className="pl-1">Остановить</span>
                                </button>
                            </div>
                        }

                        <div className="flex items-center border rounded-md mx-2">
                        <span className="font-medium px-4">
                            Расчеты: {score}
                        </span>
                            <button onClick={() => {
                                fetchAnalyze();
                                setIsModalAnalyze(true);
                            }}
                                    className={" h-full border-gray-300 rounded-r-md px-2 shadow-inner bg-blue-800 hover:bg-blue-700 text-white"}>
                                Подробнее
                                {/*<i className="fa-solid fa-question"></i>*/}
                            </button>
                        </div>

                    </div>

                    <div>
                        <button onClick={() => {
                            setIsModalDateSettings(true)
                        }}
                                className={"border h-[30px] border-gray-300 rounded-md px-2 shadow-inner bg-blue-800 hover:bg-blue-700 text-white"}>Настроить
                            дату
                        </button>
                    </div>
                    <div>
                        <button onClick={savePlan}
                                className="h-[30px] px-2 mx-2 rounded shadow-sm border border-slate-400 hover:bg-gray-200">
                            Сохранить
                            <i className="pl-2 fa-solid fa-floppy-disk"></i>
                        </button>
                        <button onClick={clickRemovePlan}
                                className="h-[30px] px-2 mx-2 rounded shadow-sm border border-slate-400 hover:bg-gray-200">
                            Удалить
                            <i className="pl-2 fa-solid fa-trash-can"></i>
                        </button>
                        <button onClick={exportExel}
                                className="h-[30px] px-2 mx-2 rounded shadow-sm border border-slate-400 hover:bg-gray-200">
                            Excel экспорт
                            <i className="pl-2 fa-solid fa-file-excel"></i>
                        </button>
                    </div>
                </div>

                <div className="m-4 border-x-2">
                    <Timeline
                        itemRenderer={customItemRenderer} // кастомный item
                        key={timelineKey} //для корректной прокрутки в начале
                        groups={groups}
                        items={items}
                        // defaultTimeStart={moment(selectDate).startOf('day').add(-2, 'hour')} //период начального отображения
                        // defaultTimeEnd={moment(selectDate).startOf('day').add(30, 'hour')}
                        onItemDoubleClick={onItemSelect}
                        // onItemSelect={handleItemSelect}
                        // onGroupSelect={handleGroupSelect}

                        onItemContextMenu={handleItemRightClick}
                        // onItemSelect={handleItemRightClick}


                        // onTimeChange={closeContextMenu}
                        ref={timelineRef}
                        onTimeChange={handleTimeChange}
                        defaultTimeStart={visibleTimeRange?.visibleTimeStart || new Date().getTime() - (24 * 60 * 60 * 1000)}
                        defaultTimeEnd={visibleTimeRange?.visibleTimeEnd || new Date().getTime() + (24 * 60 * 60 * 1000)}

                        canMove={true}
                        snap={1} // Привязка к 1 минуте (вместо 15 по умолчанию)
                        snapGrid={1} // Сетка привязки тоже 1 минута
                        // onItemMove={handleItemMove}

                        // Используем умное размещение
                        onItemMove={handleItemMoveWithSmartPlacement}
                        // onItemMoveEnd={handleItemMoveEnd}

                        onItemSelect={onItemSelect}

                        sidebarWidth={150}
                        lineHeight={90}>
                    </Timeline>


                </div>

                {isModalDateSettings && <ModalDateSettings onClose={() => {
                    setIsModalDateSettings(false)
                }}
                                                           selectDate={selectDate} setDate={onChangeSelectDate}
                                                           selectEndDate={selectEndDate}
                                                           setSelectEndDate={onChangeEndDate}
                                                           lines={startTimeLines} setLines={setStartTimeLines}
                                                           apply={selectSettings}
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



                {contextMenu.visible && <DropDownActionsItem contextMenu={contextMenu} pin={pinItems} unpin={unpinLine} isDisplayByHardware={isDisplayByHardware}
                                                             openModalMoveJobs={()=> setIsModalMoveJobs(true)}/>}

                {isModalMoveJobs && <ModalMoveJobs selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                                   moveJobs={moveJobs} onClose={() => setIsModalMoveJobs(false)}
                                                   lines={startTimeLines} planByParty={planByParty} planByHardware={planByHardware}
                />}

            </div>
        </>
    )

}





export default observer(SchedulerPage)