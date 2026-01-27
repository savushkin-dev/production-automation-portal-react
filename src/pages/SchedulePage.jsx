import "./../App.css";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import moment from 'moment';
import 'moment/locale/ru';

import {DateHeader, SidebarHeader, Timeline, TimelineHeaders} from "react-calendar-timeline";
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
import {ModalUpdateServiceWork} from "../components/scheduler/ModalUpdateServiceWork";
import {MyTimeline} from "../components/scheduler/MyTimeline";
import {convertLines, convertLinesWithTimeFields} from "../utils/scheduler/lines";
import {createTimelineLabelFormatter, formatTimelineLabel, formatTimelineLabelMain} from "../utils/scheduler/formatTimeline";
import {createTimelineRenderers, createTimelineRenderersSheduler} from "../components/scheduler/TimelineItemRenderer";
import {groupDataByDay} from "../utils/scheduler/pdayParsing";
import {getNext2DateStr, getNextDateStr, getPredDateStr} from "../utils/date/date";
import {isFactItem} from "../utils/scheduler/items";


function SchedulerPage() {

    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(true);

    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);
    const [pdayData, setPdayData] = useState({
        previousDay: [],
        currentDay: [],
        nextDay: [],
        next2Day: []
    });
    const [selectJobs, setSelectJobs] = useState([])

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSolve, setIsLoadingSolve] = useState(false);
    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalInfoItem, setIsModalInfoItem] = useState(false);
    const [isModalMoveJobs, setIsModalMoveJobs] = useState(false);
    const [isModalAssignServiceWork, setIsModalAssignServiceWork] = useState(false);
    const [isModalUpdateServiceWork, setIsModalUpdateServiceWork] = useState(false);
    const [isModalSendToWork, setIsModalSendToWrk] = useState(false);

    const [isSolve, setIsSolve] = useState(false);
    const [score, setScore] = useState({hard: 0, medium: 0, soft: 0});
    const [solverStatus, setSolverStatus] = useState("");

    const [isModalDateSettings, setIsModalDateSettings] = useState(false);
    const [isModalAnalyze, setIsModalAnalyze] = useState(false);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [analyzeObj, setAnalyzeObj] = useState(null);

    const [selectDate, setSelectDate] = useState(new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0])

    const [modalSortConfig, setModalSortConfig] = useState({
        isOpen: false,
        isSort: false,
        message: '',
        onConfirm: null
    });

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        item: null,
        forCanvas: false,
    })

    const [startTimeLines, setStartTimeLines] = useState(undefined);
    const [timelineKey, setTimelineKey] = useState(0);
    const [serviceTypes, setServiceTypes] = useState([])

    const [currentUnit, setCurrentUnit] = useState('hour');

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dateParam = params.get("date");

        if (dateParam && new Date(dateParam).toTimeString() !== "Invalid Date") {
            setSelectDate(dateParam);
            init(dateParam);
        } else {
            init(new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0])
        }

    }, [location.search]);

    async function init(date) {
        try {
            const baseDate = moment(date);

            //Устанавливаем диапазон видимого времени
            setVisibleTimeRange({
                visibleTimeStart: baseDate.clone().startOf('day').add(-2, 'hour'),
                visibleTimeEnd: baseDate.clone().startOf('day').add(30, 'hour')
            });

            const response = await SchedulerService.init(date);
            fetchPlan();

            const groupedData = groupDataByDay(response.data, baseDate);

            setPdayData({
                previousDay: groupedData.previousDay,
                currentDay: groupedData.currentDay,
                nextDay: groupedData.nextDay,
                next2Day: groupedData.next2Day
            });

            setSelectJobs(groupedData.selectJobs);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка инициализации: " + e.response.data.error)
            setIsModalNotify(true);
            setItems([])
            setScore({hard: 0, medium: 0, soft: 0})
            setPdayData({
                previousDay: [],
                currentDay: [],
                nextDay: [],
                next2Day: []
            });
        }
    }

    useEffect(() => {
        setPlanByHardware([])
        if (startTimeLines) {
             init(selectDate);
        }
    }, [selectDate])

    async function sendToWork() {
        try {
            await SchedulerService.sendToWork();
            setMsg("План успешно отправлен в работу.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка отправки плана в работу: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function agreeSorting(){
        setModalSortConfig(prevState => ({...prevState, isOpen: false}))
        await sortSchedule();
        await modalSortConfig.onConfirm?.();
    }

    async function disagreeSorting(){
        setModalSortConfig(prevState => ({...prevState, isOpen: false}))
        await modalSortConfig.onConfirm?.();
    }

    function openModalSendToWork(){
        setMsg("Вы уверены что хотите отправить план в работу?")
        setIsModalSendToWrk(true);
    }

    function clickSendToWork() {
        setMsg("Вы хотите отсортировать план перед отправкой в работу?")
        modalSortConfig.isSort? openModalSendToWork() : setModalSortConfig(prevState => ({...prevState, isOpen: true, onConfirm: ()=> openModalSendToWork()}));
    }

    function clickSavePlan(){
        setMsg("Вы хотите отсортировать план перед сохранением?")
        modalSortConfig.isSort? savePlan() : setModalSortConfig(prevState => ({...prevState, isOpen: true, onConfirm: ()=> savePlan()}));
    }

    async function savePlan() {
        try {
            await SchedulerService.savePlan();
            setMsg("План успешно сохранен.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сохранения отчета: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function fetchServiceTypes() {
        try {
            const response = await SchedulerService.getServiceTypes();
            let res = Object.entries(response.data)
                .map(([typeId, serviceName], index) => ({
                    id: typeId,
                    name: serviceName.trim(),
                }))
                .sort((a, b) => {
                    return a - b;
                });
            setServiceTypes(res)
        } catch (e) {
            console.error(e)
            setMsg("Ошибка загрузки типов сервисных операций: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function fetchLines() {
        try {
            const response = await SchedulerService.getLines();
            setStartTimeLines(convertLinesWithTimeFields(response.data))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка загрузки линий отчета: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function fetchSolve() {
        try {
            setIsLoadingSolve(true)
            await SchedulerService.solve();
            setIsSolve(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка начала планирования: " + e.response.data.error)
            setIsModalNotify(true);
        } finally {
            setIsLoadingSolve(false)
        }
    }

    async function fetchStopSolving() {
        try {
            setIsLoadingSolve(true)
            await SchedulerService.stopSolving();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка остановки планирования: " + e.response.data.error)
            setIsModalNotify(true);
        } finally {
            setIsLoadingSolve(false)
        }
    }

    async function fetchPlan() {
        try {
            const response = await SchedulerService.getPlan()
            setDownloadedPlan(response.data)
            setScore(SchedulerService.parseScoreString(response.data.score) || {hard: 0, medium: 0, soft: 0})
            setSolverStatus(response.data.solverStatus)
        } catch (e) {
            console.error(e)
            setDownloadedPlan(null)
            setScore({hard: 0, medium: 0, soft: 0})
            setIsSolve(false)
            setMsg("Ошибка получения плана: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function fetchAnalyze() {
        try {
            const response = await SchedulerService.analyze()
            setAnalyzeObj(response.data)
            setIsModalAnalyze(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка получения подробного анализа: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function reloadDirectory() {
        try {
            await SchedulerService.reloadDirectory()
            await init(selectDate);
            setMsg("Справочные данные успешно обновлены.")
            setIsModalNotify(true)
        } catch (e) {
            console.error(e)
            setMsg("Ошибка обновления справочных данных: " + e.response.data.error)
            setIsModalNotify(true)
        }
    }

    useEffect(() => {
        if (solverStatus === "NOT_SOLVING") {
            setIsSolve(false)
        } else if (solverStatus === "SOLVING_ACTIVE") {
            setIsSolve(true)
        }
    }, [solverStatus])

    function displayByHardware() {
        setIsDisplayByHardware(true);
        setGroups(hardware);
        setItems(planByHardware);
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
            SchedulerService.parseDateTimeSettings(downloadedPlan).then((e) => {
                setStartTimeLines(e)
            })
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }
    }, [downloadedPlan]);

    async function solve() {
        setModalSortConfig(prev => ({...prev, isSort: false}))
        await fetchSolve();
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
        fetchStopSolving();
        fetchLines();
        fetchServiceTypes();
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }, [])

    const [selectedItem, setSelectedItem] = useState(null);

    // Добавленные функции для динамического формата
    const handleZoom = useCallback((timelineContext) => {
        setCurrentUnit(timelineContext.timelineUnit);
    }, []);

    async function onChangeSelectDate(date) {
        setSelectDate(date);
    }

    const handleItemRightClick = (itemId, e) => {
        e.preventDefault();

        if (itemId.includes('cleaning')) {
            return;
        }

        const clickedItem = planByHardware.find(item => item.id === itemId);

        if (isFactItem(clickedItem)) {
            setContextMenu({
                visible: false,
                x: 0,
                y: 0,
                item: null,
                forCanvas: false,
                forMultiple: false,
                selectedItems: []
            });
            return;
        }

        const isClickingSelected = selectedItems.includes(clickedItem);

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
            setSelectedItems([clickedItem]);
            setSelectedItem(clickedItem);
            setLastSelectedItem(clickedItem);

            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                item: clickedItem,
                forCanvas: false,
                forMultiple: false,
                selectedItems: [clickedItem]
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
            selectedItems: []
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
            const groupPos = SchedulerService.getGroupPosition(selectedItem?.id, items).position
            await SchedulerService.pinItem(selectedItem.group, groupPos);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка прикрепления: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function unpinLine() {
        try {
            await SchedulerService.pinItem(selectedItem.group, 0);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка открепления: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    const [visibleTimeRange, setVisibleTimeRange] = useState(null);
    const timelineRef = useRef();


    const handleTimeChange = useCallback((visibleTimeStart, visibleTimeEnd, updateScrollCanvas, unit, timelineContext) => {
        setVisibleTimeRange({
            visibleTimeStart,
            visibleTimeEnd,
            updateScrollCanvas
        });
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
        setSelectedItem(planByHardware.find(item => item.id === itemId))
        setIsModalInfoItem(true)
    }

    function onItemSelect(itemId, e, time) {
        if (itemId.includes('cleaning')) {
            return;
        }
        const itemsArray = planByHardware;
        const clickedItem = itemsArray.find(item => item.id === itemId);

        if (e.shiftKey && lastSelectedItem) {
            // Shift+click - выделяем диапазон ТОЛЬКО в той же группе
            handleShiftSelect(itemId, itemsArray, clickedItem.group);
        } else {

            // Проверяем, кликаем на уже выделенный элемент
            const isClickingSelected = selectedItems.includes(clickedItem);

            if (isClickingSelected && selectedItems.length > 1) {
                // Клик на уже выделенный элемент при множественном выделении
                // НЕ меняем выделение, просто обновляем lastSelectedItem
                setLastSelectedItem(clickedItem);
            } else {
                // Клик на невыделенный элемент или одиночное выделение
                setSelectedItem(clickedItem);
                setSelectedItems([clickedItem]);
                setLastSelectedItem(clickedItem);
            }
        }
    }

    // Функция для выделения диапазона по Shift ТОЛЬКО в одной группе
    const handleShiftSelect = (itemId, itemsArray, groupId) => {
        const lastItem = lastSelectedItem;
        const currentItem = itemsArray.find(item => item.id === itemId);

        if (!lastItem || !currentItem) return;

        const groupItems = itemsArray.filter(item =>
            item.group === groupId && !item.id.includes('cleaning') && !isFactItem(item)
        );

        const sortedGroupItems = [...groupItems].sort((a, b) => a.start_time - b.start_time);

        const lastIndex = sortedGroupItems.findIndex(item => item.id === lastItem.id);
        const currentIndex = sortedGroupItems.findIndex(item => item.id === currentItem.id);

        if (lastIndex === -1 || currentIndex === -1) return;

        const startIndex = Math.min(lastIndex, currentIndex);
        const endIndex = Math.max(lastIndex, currentIndex);

        const rangeSelection = sortedGroupItems
            .slice(startIndex, endIndex + 1)

        setSelectedItems(rangeSelection);
        setSelectedItem(currentItem);
        setLastSelectedItem(currentItem);
    };

    const [selectedItems, setSelectedItems] = useState([]);
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    async function moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex) {
        try {
            await SchedulerService.moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex);
            setModalSortConfig(prev => ({...prev, isSort: false}));
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка перемещения job-ов: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function assignServiceWork(lineId, insertIndex, time, duration, type, description, isEmptyLine) {
        try {
            if(isEmptyLine){
                await SchedulerService.assignServiceWorkEmptyLine(lineId, time, duration, type, description);
            } else {
                await SchedulerService.assignServiceWork(lineId, insertIndex, duration, type, description);
            }
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения сервисной операции: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function updateServiceWork(lineId, index, duration, type, description) {
        try {
            await SchedulerService.updateServiceWork(lineId, index, duration, type, description);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка обновления сервисной операции: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function removeServiceWork(lineId, index) {
        try {
            await SchedulerService.removeServiceWork(lineId, index);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка удаления сервисной операции: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function sortSchedule() {
        try {
            await SchedulerService.sortSchedule();
            await fetchPlan();
            setModalSortConfig(prev => ({...prev, isSort: true}))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сортировки: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function reloadPlan() {
        try {
            await SchedulerService.reloadPlan(selectJobs);
            setMsg("Дозагрузка прошла успешно, можете продолжить планирование.")
            await fetchPlan();
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка дозагрузки: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function assignLineStart(lineId, startLineDateTime) {
        try {
            await SchedulerService.updateLineStart(lineId, startLineDateTime);
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения времени: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    async function assignMaxEndDateTime(lineId, maxEndDateTime) {
        try {
            await SchedulerService.updateMaxEndDateTime(lineId, maxEndDateTime);
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения времени: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    const timelineRenderers = useMemo(
        () => createTimelineRenderersSheduler(selectedItems, selectedItem),
        [selectedItems, selectedItem]
    );

    return (
        <>
            <div className="w-full">

                {isModalInfoItem && selectedItem && <ModalInfoItem item={selectedItem} onClose={() => {
                    setSelectedItem(null);
                    setIsModalInfoItem(false);
                }} lines={groups}/>}

                {isLoading &&
                    <div className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center ">Загрузка</div>
                }

                <div>
                    <h1 className=" font-bold text-center text-2xl mb-4 mt-4">Планировщик задач</h1>
                </div>

                <div className="flex flex-row">
                    <div className="w-2/6 ">
                        <button onClick={() => {
                            navigate(from, {replace: true})
                        }} className=" ml-4 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
                        </button>
                        <button onClick={() => {
                            navigate("/tracktrace", {replace: true})
                        }} className=" ml-4 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Мониторинг
                        </button>
                    </div>

                    <div className="w-4/6 py-1 flex justify-end pr-3">

                        <button onClick={clickSavePlan}
                                className="h-[30px] px-2 mx-2 rounded border border-slate-300 hover:bg-gray-100 font-medium text-[0.950rem]">
                            Сохранить
                            <i className="pl-2 fa-solid fa-floppy-disk"></i>
                        </button>

                        <button onClick={reloadDirectory}
                                className="h-[30px] px-2 mx-2 rounded border border-slate-300 hover:bg-gray-100 font-medium text-[0.950rem]">
                            Обновить справочные данные
                            <i className="pl-2 fa-solid fa-cloud-arrow-down"></i>
                        </button>

                    </div>
                </div>

                <div className="flex flex-row justify-between my-4 px-4 ">

                    <div className="w-1/3">
                        <div
                            className="inline-flex px-2 h-[30px] items-center border rounded-md hover:bg-gray-100 selection:border-0">
                            <span className="py-1 font-medium text-nowrap ">Дата:</span>
                            <input className={"px-2 font-medium w-32 hover:bg-gray-100 focus:outline-none focus:ring-0 focus:border-transparent"} type="date"
                                   value={selectDate}
                                   onChange={(e) => onChangeSelectDate(e.target.value)}
                            />
                        </div>

                        <button onClick={() => {
                            setIsModalDateSettings(true)
                        }}
                                className={"ml-3 rounded border border-slate-300 bg-blue-800 hover:bg-blue-700 text-white px-2 h-[30px] font-medium text-[0.950rem]"}>
                            Настройка линий
                        </button>

                    </div>

                    <div className="flex flex-row w-2/3 justify-between" style={{zIndex: 20}}>

                        <div className="inline-flex">
                            {!isSolve &&
                                <div onClick={solve}>
                                    <button disabled={isLoadingSolve}
                                            className="rounded text-white px-1 bg-green-600 hover:bg-green-500 h-[30px] w-36 font-medium text-[0.950rem]">
                                        <i className="fa-solid fa-play"></i>
                                        <span className="pl-1">Планировать</span>
                                    </button>
                                </div>
                            }
                            {isSolve &&
                                <div onClick={stopSolving}>
                                    <button disabled={isLoadingSolve}
                                            className="rounded text-white px-1 bg-red-600 hover:bg-red-500 h-[30px] w-36 font-medium text-[0.950rem]">
                                        <i className="fa-solid fa-stop"></i>
                                        <span className="pl-1">Остановить</span>
                                    </button>
                                </div>
                            }

                            <button onClick={() => {
                                reloadPlan();
                            }}
                                    className="h-[30px] px-2 mx-2 rounded border border-slate-300 hover:bg-gray-100 font-medium text-[0.950rem]">
                                Догрузить план
                                <i className="pl-2 fa-solid fa-arrows-rotate"></i>
                            </button>

                            <button
                                className="mr-1 rounded border border-slate-300 hover:bg-gray-100  px-3 h-[30px] font-medium text-[0.950rem]"
                                onClick={sortSchedule}>
                                Отсортировать
                            </button>

                            <button onClick={() => {
                                clickSendToWork()
                            }}
                                    className="h-[30px] px-2 mx-2 rounded border border-slate-300 hover:bg-cyan-500 bg-cyan-600 text-white font-medium text-[0.950rem]">
                                Отправить в работу
                                <i className="pl-2 fa-solid fa-paper-plane"></i>
                            </button>
                        </div>


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
                            }}
                                    className={" h-full rounded-r px-2 bg-blue-800 hover:bg-blue-700 text-white font-medium text-[0.950rem]"}>
                                Подробнее
                            </button>
                        </div>


                    </div>

                </div>

                <div className="m-4 border-x-2">
                    <Timeline
                        itemRenderer={timelineRenderers.itemRenderer}
                        groupRenderer={timelineRenderers.groupRenderer}
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
                        buffer={5}
                        sidebarWidth={150}
                        lineHeight={150}

                    >
                        <TimelineHeaders className="sticky">
                            <SidebarHeader>
                                {({getRootProps}) => (
                                    <div {...getRootProps()} className="bg-blue-800">
                                        {/* Заголовок сайдбара */}
                                        <div
                                            className="text-white font-medium text-3xl text-center h-full content-center">
                                            {/*<i className="fa-regular fa-calendar-check"></i>*/}
                                        </div>
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


                            {false &&
                                <MyTimeline/>
                            }
                        </TimelineHeaders>
                    </Timeline>
                </div>

                {isModalDateSettings && <ModalDateSettings onClose={() => {
                    setIsModalDateSettings(false)
                }}

                                                           lines={startTimeLines}
                                                           setLines={setStartTimeLines}
                                                           changeTime={assignLineStart} changeMaxEndTime={assignMaxEndDateTime}
                />}

                {isModalAnalyze && <ModalAnalyze onClose={() => setIsModalAnalyze(false)}
                                                 analyzeObj={analyzeObj}
                />}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}

                {isModalSendToWork &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setIsModalSendToWrk(false)}
                                       onAgree={() => {
                                           setIsModalSendToWrk(false);
                                           sendToWork();
                                       }} onDisagree={() => setIsModalSendToWrk(false)}/>}

                {modalSortConfig.isOpen &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setModalSortConfig(prev => ({...prev, isOpen: false}))}
                                       onAgree={() => {agreeSorting()}}
                                       onDisagree={() => {disagreeSorting()}}/>}

                {contextMenu.visible && <DropDownActionsItem contextMenu={contextMenu} pin={pinItems} unpin={unpinLine}
                                                             isDisplayByHardware={isDisplayByHardware}
                                                             openModalMoveJobs={() => setIsModalMoveJobs(true)}
                                                             openModalAssignSettings={() => setIsModalAssignServiceWork(true)}
                                                             selectedItems={selectedItems}
                                                             updateServiceWork={() => setIsModalUpdateServiceWork(true)}
                                                             removeServiceWork={removeServiceWork}/>}

                {isModalMoveJobs &&
                    <ModalMoveJobs selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                   moveJobs={moveJobs} onClose={() => setIsModalMoveJobs(false)}
                                   lines={startTimeLines} planByHardware={planByHardware}
                    />}

                {isModalAssignServiceWork &&
                    <ModalAssignServiceWork selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                            assignServiceWork={assignServiceWork}
                                            onClose={() => setIsModalAssignServiceWork(false)}
                                            lines={startTimeLines}
                                            planByHardware={planByHardware} selectDate={selectDate}
                                            serviceTypes={serviceTypes}
                    />}

                {isModalUpdateServiceWork &&
                    <ModalUpdateServiceWork selectedItems={selectedItems} isDisplayByHardware={isDisplayByHardware}
                                            onClose={() => setIsModalUpdateServiceWork(false)}
                                            lines={startTimeLines}
                                            planByHardware={planByHardware}
                                            updateServiceWork={updateServiceWork}
                                            serviceTypes={serviceTypes}
                    />
                }

                <DataTable data={pdayData.previousDay} setData={(newData) => setPdayData(prev => ({
                    ...prev,
                    previousDay: newData
                }))} dateData={getPredDateStr(selectDate)} selectJobs={selectJobs} setSelectJobs={setSelectJobs}/>

                <DataTable data={pdayData.currentDay} setData={(newData) => setPdayData(prev => ({
                    ...prev,
                    currentDay: newData
                }))} dateData={selectDate} selectJobs={selectJobs} setSelectJobs={setSelectJobs}/>

                <DataTable data={pdayData.nextDay} setData={(newData) => setPdayData(prev => ({
                    ...prev,
                    nextDay: newData
                }))} dateData={getNextDateStr(selectDate)} selectJobs={selectJobs} setSelectJobs={setSelectJobs}/>

                <DataTable data={pdayData.next2Day} setData={(newData) => setPdayData(prev => ({
                    ...prev,
                    next2Day: newData
                }))}  dateData={getNext2DateStr(selectDate)} selectJobs={selectJobs} setSelectJobs={setSelectJobs}/>


            </div>
        </>
    )
}

export default observer(SchedulerPage)