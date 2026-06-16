import "./../App.css";
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
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
import {ModalAssignServiceWork} from "../components/scheduler/ModalAssignServiceWork";
import {ModalUpdateServiceWork} from "../components/scheduler/ModalUpdateServiceWork";
import {MyTimeline} from "../components/scheduler/MyTimeline";
import {convertLinesWithTimeFields, isValidLinesDate} from "../utils/scheduler/lines";
import {formatTimelineLabel, formatTimelineLabelMain} from "../utils/scheduler/formatTimeline";
import {createTimelineRenderersSheduler} from "../components/scheduler/TimelineItemRenderer";
import {groupDataByDay} from "../utils/scheduler/pdayParsing";
import {
    calculateTimeToNext8AM,
    filterGroupItems, getLastItemIndexInGroup, isCleaningDelayItem,
    isCleaningItem,
    isDelayItem, isFactCleaningItem,
    isFactItem,
    isPackagedItem
} from "../utils/scheduler/items";
import {DisplayButtons} from "../components/scheduler/DisplayButtons";
import {ModalNotifyError} from "../components/modal/ModalNotifyError";
import {ModalUpdateJobDelay} from "../components/scheduler/ModalUpdateJobDelay";
import {convertHoursMinutesToMinutes} from "../utils/scheduler/serviceWork";
import {Context} from "../index";
import AuthLabel from "../components/AuthLabel";
import {ModalVersionSettings} from "../components/scheduler/ModalVersionSettings";
import {SchedulerDataTables} from "../components/scheduler/SchedulerDataTables";
import {ModalColorsSettings} from "../components/scheduler/ModalColorsSettings";
import {ModalReports} from "../components/scheduler/ModalReports";
import Loading from "../components/loading/Loading";


function SchedulerPage() {

    const {store} = useContext(Context);
    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(true);

    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);
    const [pdayData, setPdayData] = useState({
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
    });
    const [selectJobs, setSelectJobs] = useState([])

    const [loading, setLoading] = useState({
        isLoading: false,
        message: "Загрузка..."
    });
    const [isLoadingStartSolve, setIsLoadingStartSolve] = useState(false);
    const [isLoadingStopSolve, setIsLoadingStopSolve] = useState(false);
    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalNotifyError, setIsModalNotifyError] = useState(false);
    const [isModalInfoItem, setIsModalInfoItem] = useState(false);
    const [isModalMoveJobs, setIsModalMoveJobs] = useState(false);
    const [isModalAssignServiceWork, setIsModalAssignServiceWork] = useState(false);
    const [isModalUpdateServiceWork, setIsModalUpdateServiceWork] = useState(false);
    const [isModalSendToWork, setIsModalSendToWork] = useState(false);
    const [isModalSavePlan, setIsModalSavePlan] = useState(false);
    const [isModalUpdateDelay, setIsModalUpdateDelay] = useState(false);
    const [isModalColorsSettings, setIsModalColorsSettings] = useState(false);
    const [isModalReports, setIsModalReports] = useState(false);


    const [isSolve, setIsSolve] = useState(false);
    const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false);
    const [score, setScore] = useState({hard: 0, medium: 0, soft: 0});
    const [solverStatus, setSolverStatus] = useState("");

    const [isModalDateSettings, setIsModalDateSettings] = useState(false);
    const [isModalVersionSettings, setIsModalVersionSettings] = useState(false);
    const [isModalAnalyze, setIsModalAnalyze] = useState(false);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [analyzeObj, setAnalyzeObj] = useState(null);

    const [selectDate, setSelectDate] = useState(new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0]);
    const [planVersion, setPlanVersion] = useState("Основной план");
    const [isDropdownButtonOpen, setIsDropdownButtonOpen] = useState(false);

    const [modalSortConfig, setModalSortConfig] = useState({
        isOpen: false,
        isSort: true,
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

    const [activeDisplay, setActiveDisplay] = useState({
        planFact: false,
        plan: true,
        fact: false
    });

    const [startTimeLines, setStartTimeLines] = useState(undefined);
    const [timelineKey, setTimelineKey] = useState(0);
    const [serviceTypes, setServiceTypes] = useState([])

    const [currentUnit, setCurrentUnit] = useState('hour');

    const location = useLocation();

    const [selectedItems, setSelectedItems] = useState([]);
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    const heightGroupScheduler = activeDisplay.fact || activeDisplay.plan ? 100 : 164;

    const [clickedCameras, setClickedCameras] = useState({});

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

            setPdayData(groupedData);

            setSelectJobs(groupedData.selectJobs);
            return true;
        } catch (e) {
            console.error(e)
            setMsg("Ошибка инициализации: " + e.response.data.message)
            setIsModalNotifyError(true);
            setItems([])
            setScore({hard: 0, medium: 0, soft: 0})
            setPdayData({
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
            });
            return false;
        }
    }

    useEffect(() => {
        setPlanByHardware([])
        if (startTimeLines) {
            init(selectDate);
        }
    }, [selectDate])

    async function alignPlan() {
        try {
            await SchedulerService.alignPlan();
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка выравнивания плана: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function sendToWork() {
        try {
            await SchedulerService.sendToWork();
            setMsg("План успешно отправлен в работу.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка отправки плана в работу: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function agreeSorting() {
        setModalSortConfig(prevState => ({...prevState, isOpen: false}))
        await sortSchedule();
        await modalSortConfig.onConfirm?.();
    }

    async function disagreeSorting() {
        setModalSortConfig(prevState => ({...prevState, isOpen: false}))
        await modalSortConfig.onConfirm?.();
    }

    function openModalSendToWork() {
        setMsg("Вы уверены что хотите отправить план в работу?")
        setIsModalSendToWork(true);
    }

    function openModalSavePlan() {
        setMsg("Вы уверены что хотите сохранить план?")
        setIsModalSavePlan(true);
    }

    function clickSendToWork() {
        setMsg("Вы хотите отсортировать план перед отправкой в работу?")
        modalSortConfig.isSort ? openModalSendToWork() : setModalSortConfig(prevState => ({
            ...prevState,
            isOpen: true,
            onConfirm: () => openModalSendToWork()
        }));
    }

    function clickSavePlan() {
        setMsg("Вы хотите отсортировать план перед сохранением?")
        modalSortConfig.isSort ? openModalSavePlan() : setModalSortConfig(prevState => ({
            ...prevState,
            isOpen: true,
            onConfirm: () => openModalSavePlan()
        }));
    }

    async function savePlan() {
        try {
            setLoading({ isLoading: true, message: "Сохранение плана..." });
            await SchedulerService.savePlan();
            setMsg("План успешно сохранен.")
            setIsModalNotify(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сохранения отчета: " + e.response.data.message)
            setIsModalNotifyError(true);
        } finally {
            setLoading({ isLoading: false, message: "" });
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
            setMsg("Ошибка загрузки типов сервисных операций: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function fetchLines() {
        try {
            const response = await SchedulerService.getLines();
            setStartTimeLines(convertLinesWithTimeFields(response.data))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка загрузки линий отчета: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function fetchSolve() {
        try {
            setIsLoadingStartSolve(true)
            await SchedulerService.solve();
            setIsSolve(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка начала планирования: " + e.response.data.message)
            setIsModalNotifyError(true);
        } finally {
            setIsLoadingStartSolve(false)
        }
    }

    async function fetchStopSolving() {
        try {
            setIsLoadingStopSolve(true)
            await SchedulerService.stopSolving();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка остановки планирования: " + e.response.data.message)
            setIsModalNotifyError(true);
        } finally {
            setIsLoadingStopSolve(false)
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
            setMsg("Ошибка получения плана: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function fetchAnalyze() {
        try {
            const response = await SchedulerService.analyze()
            setAnalyzeObj(response.data)
            setIsModalAnalyze(true);
        } catch (e) {
            console.error(e)
            setMsg("Ошибка получения подробного анализа: " + e.response.data.message)
            setIsModalNotifyError(true);
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
            setMsg("Ошибка обновления справочных данных: " + e.response.data.message)
            setIsModalNotifyError(true)
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
        (isValidLinesDate(startTimeLines)) ? await fetchSolve() : setLinesDateError();

        setIsStopButtonDisabled(true);
        setTimeout(() => {
            setIsStopButtonDisabled(false);
        }, 120000); // 2 минуты
    }

    function setLinesDateError() {
        setMsg("Перед началом планирования или дозагрузки требуется настроить время начала и максимальное время линий в разделе \"Настройка линий\")")
        setIsModalNotifyError(true);
    }

    useEffect(() => {
        let intervalId;

        if (isSolve) {
            intervalId = setInterval(() => {
                fetchPlan();
            }, 5000);
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
        if (activeDisplay.fact) {
            return
        }
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
            setMsg("Ошибка прикрепления: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function unpinLine() {
        try {
            await SchedulerService.pinItem(selectedItem.group, 0);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка открепления: " + e.response.data.message)
            setIsModalNotifyError(true);
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

                linkPlanItemToFactItem(clickedItem)
            }
        }
    }

    //Добавляет в список выбранных элементов фактические или плановые элементы соответствующие друг другу (включая мойки и отклонения)
    function linkPlanItemToFactItem(clickedItem) {
        const itemsArray = planByHardware;

        // 1. Обработка плановой мойки
        if (isCleaningItem(clickedItem)) {
            const parentJobId = clickedItem.info.parentJobId;
            if (!parentJobId) return;

            const factCleaning = itemsArray.find(item =>
                isFactCleaningItem(item) && item.info.parentJobId === parentJobId
            );

            if (factCleaning) {
                setSelectedItems([clickedItem, factCleaning]);
            }
            return;
        }

        // 2. Обработка фактической мойки
        if (isFactCleaningItem(clickedItem)) {
            const parentJobId = clickedItem.info.parentJobId;
            if (!parentJobId) return;

            const planCleaning = itemsArray.find(item =>
                isCleaningItem(item) && item.info.parentJobId === parentJobId
            );

            if (planCleaning) {
                setSelectedItems([clickedItem, planCleaning]);
            }
            return;
        }

        // 3. Обработка отклонения мойки
        if (isCleaningDelayItem(clickedItem)) {
            const parentJobId = clickedItem.info.parentJobId;
            if (!parentJobId) return;

            const factCleaning = itemsArray.find(item =>
                isFactCleaningItem(item) && item.info.parentJobId === parentJobId
            );

            if (factCleaning) {
                setSelectedItems([clickedItem, factCleaning]);
            }
            return;
        }

        // 4. Обработка production элементов (плановых и фактовых)
        // Проверяем, что это не мойка и не отклонение
        if (!isCleaningItem(clickedItem) && !isFactCleaningItem(clickedItem) && !isCleaningDelayItem(clickedItem)) {
            const prefix = "fact_camera";
            let targetId = null;

            if (!isFactItem(clickedItem)) {
                targetId = clickedItem.id + prefix;
            } else {
                targetId = clickedItem.id.slice(0, -prefix.length);
            }

            const targetItem = itemsArray.find(item => item.id === targetId);
            if (targetItem) {
                setSelectedItems([clickedItem, targetItem]);
            }
            return;
        }
    }

    // Функция для выделения диапазона по Shift ТОЛЬКО в одной группе
    const handleShiftSelect = (itemId, itemsArray, groupId) => {
        const lastItem = lastSelectedItem;
        const currentItem = itemsArray.find(item => item.id === itemId);

        if (!lastItem || !currentItem) return;

        const groupItems = itemsArray.filter(item =>
            item.group === groupId && !isCleaningItem(item) && !isDelayItem(item) && !isFactItem(item)
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

    async function moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex) {
        try {
            await SchedulerService.moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка перемещения job-ов: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function assignServiceWork(lineId, insertIndex, time, duration, type, description, isEmptyLine) {
        try {
            if (isEmptyLine) {
                await SchedulerService.assignServiceWorkEmptyLine(lineId, time, duration, type, description);
            } else {
                await SchedulerService.assignServiceWork(lineId, insertIndex, duration, type, description);
            }
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения сервисной операции: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function determineFactPlace(snpz) {
        try {
            await SchedulerService.determineFactPlace(snpz);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка определения количества мест по факту: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function determineCameraFact(snpz) {
        try {
            await SchedulerService.determineCameraFact(snpz);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка определения данных по камере: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    //Для обновления в modelInfoItem выбранного элемента
    useEffect(() => {
        if (selectedItem && selectedItem.info.snpz) {
            const updatedItem = items.find(item => item.info.snpz === selectedItem.info.snpz);
            setSelectedItem(updatedItem);
        }
    }, [items]);

    async function updateServiceWork(lineId, index, duration, type, description) {
        try {
            await SchedulerService.updateServiceWork(lineId, index, duration, type, description);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка обновления сервисной операции: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function removeServiceWork(lineId, index) {
        try {
            await SchedulerService.removeServiceWork(lineId, index);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка удаления сервисной операции: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function sortSchedule() {
        try {
            await SchedulerService.sortSchedule();
            await fetchPlan();
            setModalSortConfig(prev => ({...prev, isSort: true}))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сортировки: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function ClickReloadPlan() {
        (isValidLinesDate(startTimeLines)) ? await reloadPlan() : setLinesDateError();
    }

    async function reloadPlan() {
        try {
            await SchedulerService.reloadPlan(selectJobs);
            setMsg("Дозагрузка прошла успешно, можете продолжить планирование.")
            await fetchPlan();
            setIsModalNotify(true);
            setModalSortConfig(prev => ({...prev, isSort: false}));
        } catch (e) {
            console.error(e)
            setMsg("Ошибка дозагрузки: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function assignLineStart(lineId, startLineDateTime) {
        try {
            await SchedulerService.updateLineStart(lineId, startLineDateTime);
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения времени: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function assignMaxEndDateTime(lineId, maxEndDateTime) {
        try {
            await SchedulerService.updateMaxEndDateTime(lineId, maxEndDateTime);
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка назначения времени: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    function sortRange(sortUp) {
        const filteredItems = selectedItems
            .filter(item => !isFactItem(item));

        // if (filteredItems.some(item => isPackagedItem(item) || isMaintenanceItem(item))) {
        //     setMsg("Сортировка невозможна. В выделенном диапазоне присутствуют сервисные операции.");
        //     setIsModalNotify(true);
        //     return;
        // }

        const groupId = filteredItems[0].group;
        const sortedSelected = filteredItems
            .sort((a, b) => a.start_time - b.start_time);
        const firstItem = sortedSelected[0];
        const firstItemIndex = firstItem.info.groupIndex - 1;

        sortRangeScheduler(firstItemIndex, filteredItems.length, groupId, sortUp)
    }

    async function sortRangeScheduler(fromIndex, sortCount, lineId, sortUp) {
        try {
            await SchedulerService.sortRangeScheduler(fromIndex, sortCount, lineId, sortUp);
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка сортировки диапазона: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function dailyCleaning() {
        try {
            await SchedulerService.dailyCleaning();
            await fetchPlan()
        } catch (e) {
            console.error(e)
            setMsg("Ошибка добавления суточной мойки: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function updateDelayJob(lineId, index, delayNote) {
        try {
            await SchedulerService.updateDelayJob(lineId, index, delayNote);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка обновления отклонения от плана: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    async function updateDelayCleaning(lineId, index, delayNote) {
        try {
            await SchedulerService.updateDelayCleaning(lineId, index, delayNote);
            await fetchPlan();
        } catch (e) {
            console.error(e)
            setMsg("Ошибка обновления отклонения мойки от плана: " + e.response.data.message)
            setIsModalNotifyError(true);
        }
    }

    const timelineRenderers = useMemo(
        () => {
            return createTimelineRenderersSheduler(selectedItems, selectedItem, activeDisplay, selectDate)
        },
        [selectedItems, selectedItem, activeDisplay, timelineKey]
    );

    async function assignAllPauses() {
        const allLines = startTimeLines || [];
        if (allLines.length === 0) {
            console.log('Нет линий для обработки');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const line of allLines) {
            const lineId = line.lineId || line.id || line.value;

            const lineItems = planByHardware?.filter(item =>
                item.info?.lineInfo?.id === lineId
            ) || [];

            const filteredItems = filterGroupItems(lineId, lineItems);

            const hasJobsOnLine = filteredItems.length > 0;

            try {
                if (!hasJobsOnLine) {

                    // Просто добавляем 'T08:00' к дате из selectDate
                    const timeStr = `${selectDate}T08:00`;

                    await SchedulerService.assignServiceWorkEmptyLine(
                        lineId,
                        timeStr,
                        1440, // 24 часа в минутах
                        "8",
                        "Простой до 08:00"
                    );
                    successCount++;
                } else {
                    // Если есть элементы, находим последний
                    const lastItem = filteredItems.reduce((max, current) => {
                        const currentEnd = new Date(current.info?.end || 0);
                        const maxEnd = new Date(max.info?.end || 0);
                        return currentEnd > maxEnd ? current : max;
                    }, filteredItems[0]);

                    const lastEndTime = lastItem.info?.end;

                    if (!lastEndTime) {
                        throw new Error(`Нет времени окончания у последнего элемента на линии ${lineId}`);
                    }

                    // Рассчитываем время до следующих 8 утра
                    const timeTo8AM = calculateTimeToNext8AM(lastEndTime);

                    // Проверяем, что время до 8 утра больше 0
                    if (timeTo8AM.hours === 0 && timeTo8AM.minutes === 0) {
                        continue;
                    }
                    const totalMinutes = convertHoursMinutesToMinutes(timeTo8AM.hours, timeTo8AM.minutes);
                    const insertPosition = getLastItemIndexInGroup(lineId, planByHardware) + 1;

                    await SchedulerService.assignServiceWork(
                        lineId,
                        insertPosition,
                        totalMinutes,
                        "8",
                        "Простой до 08:00"
                    );
                    successCount++;
                }
            } catch (error) {
                errorCount++;
                errors.push({lineId, error: error.response?.data?.message || error.message});
                console.error(`Ошибка при добавлении на линию ${lineId}:`, error);
            }
        }

        if (errors.length > 0) {
            console.error('Детали ошибок:', errors);
            setMsg("Ошибки при назначении сервисных операций: " + errors.map(e => `${e.lineId}: ${e.error}`).join('; '));
            setIsModalNotifyError(true);
        }

        if (successCount > 0) {
            await fetchPlan();
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Проверяем, что клик был не по нашему dropdown контейнеру
            const dropdownContainer = document.querySelector('.relative');
            if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                setIsDropdownButtonOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            <div className="w-full text-gray-800">

                {isModalInfoItem && selectedItem && <ModalInfoItem item={selectedItem} onClose={() => {
                    setSelectedItem(null);
                    setIsModalInfoItem(false);
                }} lines={groups} determineFactPlace={determineFactPlace} determineCameraFact={determineCameraFact}
                                                                   clickedCameras={clickedCameras}
                                                                   setClickedCameras={setClickedCameras}
                                                                   setModalError={setIsModalNotifyError}
                                                                   setErrorMsg={setMsg}/>}

                {loading.isLoading && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{zIndex: 9999}}>
                        <div className="bg-white rounded-lg px-12 py-6 shadow-xl flex flex-col items-center gap-3 animate-[scaleIn_0.3s_ease]">
                            <div className="circle my-4">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                            <span className="text-gray-800 font-medium">{loading.message}</span>
                            <span className="text-gray-400 text-sm">Пожалуйста, подождите</span>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>

                <div className="flex items-center justify-between mb-4 mt-4 px-4">
                    <button onClick={() => {
                        navigate(from, {replace: true})
                    }} className="py-1 px-2 rounded text-blue-800 hover:bg-blue-50 whitespace-nowrap">
                    Вернуться назад
                    </button>

                    <h1 className="font-bold text-gray-800 text-center text-2xl absolute left-1/2 -translate-x-1/2">Планировщик
                        задач</h1>

                    <div className="flex items-center gap-3">
                        <AuthLabel loginPath={'/login-scheduler'} logoutPath={'/login-scheduler'}/>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div className="w-2/6 flex justify-start">

                        <div
                            className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
                            <i className="fa-solid fa-code-branch text-gray-400 text-sm"></i>
                            <span className="text-sm text-gray-400">Версия:</span>
                            <span className="text-sm font-medium text-gray-700 max-w-[180px] truncate">
                                {planVersion}
                            </span>
                        </div>

                    </div>


                    <div className="w-4/6 py-1 flex justify-end pr-3 gap-1">

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownButtonOpen(!isDropdownButtonOpen)}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600"
                            >
                                Доп. функции
                                {isDropdownButtonOpen ? (
                                    <i className="pl-2 fa-solid fa-chevron-up"></i>
                                ) : (
                                    <i className="pl-2 fa-solid fa-chevron-down"></i>
                                )}
                            </button>

                            {/* Выпадающее меню */}
                            {isDropdownButtonOpen && (
                                <div
                                    className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <button
                                        onClick={() => {
                                            assignAllPauses();
                                            setIsDropdownButtonOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-[0.900rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 flex items-center justify-between"
                                    >
                                        Добавить простои
                                        <i className="fa-solid fa-stopwatch"></i>
                                    </button>

                                    <button
                                        onClick={() => {
                                            dailyCleaning();
                                            setIsDropdownButtonOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-[0.900rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 flex items-center justify-between"
                                    >
                                        Добавить мойки
                                        <i className="fa-solid fa-faucet-drip"></i>
                                    </button>

                                    <button
                                        onClick={() => {
                                            alignPlan();
                                            setIsDropdownButtonOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-[0.900rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 flex items-center justify-between"
                                    >
                                        Выровнять план
                                        <i className="fa-solid fa-align-right"></i>
                                    </button>

                                    <button
                                        onClick={() => {
                                            reloadDirectory();
                                            setIsDropdownButtonOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-[0.900rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 flex items-center justify-between"
                                    >
                                        Обновить справочные данные
                                        <i className="fa-solid fa-cloud-arrow-down"></i>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsModalVersionSettings(true);
                                            setIsDropdownButtonOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-[0.900rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 flex items-center justify-between"
                                    >
                                        <span>Управление версиями</span>
                                        <i className="fa-solid fa-code-branch "></i>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => {
                            setIsModalReports(true)
                        }}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                            Экспорт отчетов
                            <i className="pl-2 fa-solid fa-file-arrow-down"></i>
                        </button>

                        {/* Основные кнопки */}
                        <button onClick={sortSchedule}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                            Отсортировать
                            <i className="pl-2 fa-solid fa-sort"></i>
                        </button>

                        <button onClick={clickSavePlan}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                            Сохранить
                            <i className="pl-2 fa-solid fa-floppy-disk"></i>
                        </button>

                    </div>
                </div>

                <div className="flex flex-row justify-between my-4 px-4">

                    <div className="w-2/5 inline-flex justify-between pr-10">

                        <div className="inline-flex items-center h-[30px] border border-gray-200 rounded-md">
                            <span className="px-3 text-[0.950rem] font-medium text-gray-600 border-r border-gray-200">
                                Дата:
                            </span>
                            <input
                                className="px-2 text-[0.950rem] font-medium text-gray-700 cursor-pointer focus:outline-none bg-transparent"
                                type="date"
                                value={selectDate}
                                onChange={(e) => onChangeSelectDate(e.target.value)}
                            />
                        </div>

                        <button onClick={() => {
                            setIsModalDateSettings(true)
                        }}
                                className="px-3 h-[30px] text-[0.950rem] font-medium rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
                            Настройка линий
                            <i className="pl-2 fa-solid fa-gears"></i>
                        </button>

                        <DisplayButtons activeDisplay={activeDisplay}
                                        setActiveDisplay={(newDisplay) => {
                                            setTimelineKey(prev => prev + 1);
                                            setActiveDisplay(newDisplay);
                                        }}
                        />


                    </div>

                    <div className="flex flex-row w-3/5 justify-between" style={{zIndex: 20}}>

                        <div className="inline-flex items-center gap-3">
                            {!isSolve && !isLoadingStopSolve &&
                                <button onClick={solve} disabled={isLoadingStartSolve || isLoadingStopSolve}
                                        className="px-3 h-[30px] w-34 text-[0.950rem] font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2">
                                    <i className="fa-solid fa-play text-xs pt-0.5"></i>
                                    <span>Планировать</span>
                                </button>
                            }
                            {isSolve && !isLoadingStartSolve &&
                                <button onClick={stopSolving} disabled={isLoadingStartSolve || isLoadingStopSolve || isStopButtonDisabled}
                                        className="px-3 h-[30px] w-34 text-[0.950rem] font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <i className="fa-solid fa-stop text-xs pt-0.5"></i>
                                    <span>Остановить</span>
                                </button>
                            }

                            {isLoadingStopSolve && (
                                <button disabled
                                        className="px-3 h-[30px] w-34 text-[0.950rem] font-medium rounded-md bg-red-600 opacity-50 text-white transition-all duration-200 flex items-center gap-2 cursor-not-allowed">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Остановка...</span>
                                </button>
                            )}

                            <button onClick={() => {
                                ClickReloadPlan()
                            }}
                                    className="px-3 h-[30px] text-[0.950rem] font-medium rounded-md border border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600 transition-all duration-200 flex items-center gap-1">
                                <span>Догрузить план</span>
                                <i className="fa-solid fa-arrows-rotate text-xs pt-0.5"></i>
                            </button>

                            <button onClick={() => {
                                clickSendToWork()
                            }}
                                    className="px-3 h-[30px] text-[0.950rem] font-medium rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-1">
                                <span>Отправить в работу</span>
                                <i className="fa-solid fa-paper-plane text-xs pt-0.5"></i>
                            </button>
                        </div>

                        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-[30px]">
                            <div
                                className="flex items-center justify-between px-2 text-md font-medium text-gray-700 w-96 h-full">
                                <div className="flex flex-col items-center justify-center flex-1">
                                    <span className="text-[0.900rem] px-1 mt-[-3px] text-gray-800">{score.hard}</span>
                                    <span className="text-[0.750rem] mt-[-8px] text-gray-500">Ошибки</span>
                                </div>
                                <span className="text-gray-500 text-lg leading-none">|</span>
                                <div className="flex flex-col items-center justify-center flex-1">
                                    <span className="text-[0.900rem] px-1 mt-[-3px] text-gray-800">{score.medium}</span>
                                    <span className="text-[0.750rem] mt-[-8px] text-gray-500">Время простоя</span>
                                </div>
                                <span className="text-gray-500 text-lg leading-none">|</span>
                                <div className="flex flex-col items-center justify-center flex-1">
                                    <span className="text-[0.900rem] px-1 mt-[-3px] text-gray-800">{score.soft}</span>
                                    <span
                                        className="text-[0.750rem] text-xs mt-[-8px] text-gray-500">Время выполнения</span>
                                </div>
                            </div>
                            <button onClick={() => {
                                fetchAnalyze()
                            }}
                                    className="h-full px-2 bg-blue-800 hover:bg-blue-700 text-white font-medium text-[0.950rem] transition-all duration-200">
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
                        lineHeight={heightGroupScheduler}

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
                                                           changeTime={assignLineStart}
                                                           changeMaxEndTime={assignMaxEndDateTime}
                />}

                {isModalAnalyze && <ModalAnalyze onClose={() => setIsModalAnalyze(false)}
                                                 analyzeObj={analyzeObj}
                />}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}

                {isModalNotifyError &&
                    <ModalNotifyError title={"Ошибка операции"} message={msg}
                                      onClose={() => setIsModalNotifyError(false)}/>}

                {isModalSendToWork &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setIsModalSendToWork(false)}
                                       onAgree={() => {
                                           setIsModalSendToWork(false);
                                           sendToWork();
                                       }} onDisagree={() => setIsModalSendToWork(false)}/>}

                {isModalSavePlan &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setIsModalSavePlan(false)}
                                       onAgree={() => {
                                           setIsModalSavePlan(false);
                                           savePlan();
                                       }} onDisagree={() => setIsModalSavePlan(false)}/>}

                {modalSortConfig.isOpen &&
                    <ModalConfirmation title={"Подтверждение действия"} message={msg}
                                       onClose={() => setModalSortConfig(prev => ({...prev, isOpen: false}))}
                                       onAgree={() => {
                                           agreeSorting()
                                       }}
                                       onDisagree={() => {
                                           disagreeSorting()
                                       }}/>}

                {contextMenu.visible && <DropDownActionsItem contextMenu={contextMenu} pin={pinItems} unpin={unpinLine}
                                                             isDisplayByHardware={isDisplayByHardware}
                                                             openModalMoveJobs={() => setIsModalMoveJobs(true)}
                                                             openModalAssignSettings={() => setIsModalAssignServiceWork(true)}
                                                             selectedItems={selectedItems}
                                                             updateServiceWork={() => setIsModalUpdateServiceWork(true)}
                                                             removeServiceWork={removeServiceWork}
                                                             sortRange={sortRange}
                                                             updateDelay={() => setIsModalUpdateDelay(true)}
                />}

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

                {isModalUpdateDelay &&
                    <ModalUpdateJobDelay onClose={() => setIsModalUpdateDelay(false)}
                                         updateDelayJob={updateDelayJob} updateDelayCleaning={updateDelayCleaning}
                                         selectedItems={selectedItems}/>
                }

                {isModalVersionSettings &&
                    <ModalVersionSettings date={selectDate} onInit={init} onFetchPlan={fetchPlan}
                                          onClose={() => setIsModalVersionSettings(false)}
                                          setModalError={setIsModalNotifyError} setErrorMsg={setMsg}
                                          setPlanVersion={setPlanVersion}/>
                }

                {isModalColorsSettings &&
                    <ModalColorsSettings onClose={() => setIsModalColorsSettings(false)}
                                         onSave={() => setTimelineKey(prev => prev + 1)}/>
                }

                {isModalReports &&
                    <ModalReports onClose={()=>{setIsModalReports(false)}}
                                  setModalError={setIsModalNotifyError} setErrorMsg={setMsg}/>
                }


                {/* Блок с индикаторами и настройки цветов */}
                <div key={timelineKey} className="flex items-center gap-4 mx-3 px-3 rounded-md flex-wrap">
                    <button onClick={() => setIsModalColorsSettings(true)}
                            className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                        Настройка цветов
                        <i className="pl-2 fa-solid fa-palette"></i>
                    </button>

                    <div className="flex items-center gap-2">
                        <div
                            className="w-12 h-5 border border-gray-400 relative bg-white text-[9px] flex items-center justify-center font-bold"
                            style={{
                                borderLeftColor: localStorage.getItem('scheduler_left_border_color') || '#436fff',
                                borderLeftWidth: `${localStorage.getItem('scheduler_left_border_width') || '3'}px`
                            }}
                        >
                            <span className="z-10">Мойка</span>
                        </div>
                        <span className="text-xs text-gray-600">Мойка быстрее плана</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className="w-12 h-5 border border-gray-400 relative bg-white text-[9px] flex items-center justify-center font-bold"
                            style={{
                                borderBottomColor: localStorage.getItem('scheduler_bottom_border_color') || '#c100cf',
                                borderBottomWidth: `${localStorage.getItem('scheduler_bottom_border_width') || '2'}px`
                            }}
                        >
                            <span className="z-10">Задание</span>
                        </div>
                        <span className="text-xs text-gray-600">Задание на выбранную дату</span>
                    </div>
                </div>

                <SchedulerDataTables
                    pdayData={pdayData}
                    setPdayData={setPdayData}
                    selectDate={selectDate}
                    selectJobs={selectJobs}
                    setSelectJobs={setSelectJobs}
                    lines={startTimeLines}
                    isReadOnly={planVersion !== "Основной план"}
                />

            </div>
        </>
    )

}

export default observer(SchedulerPage)