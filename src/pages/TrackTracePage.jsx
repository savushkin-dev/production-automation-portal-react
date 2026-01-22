import {observer} from "mobx-react-lite";
import {ModalInfoItem} from "../components/scheduler/ModalInfoItem";
import {DateHeader, SidebarHeader, Timeline, TimelineHeaders} from "react-calendar-timeline";
import {ModalNotify} from "../components/modal/ModalNotify";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import SchedulerService from "../services/ScheduleService";
import moment from "moment/moment";
import ScheduleService from "../services/ScheduleService";
import {formatTimelineLabel, formatTimelineLabelMain} from "../utils/scheduler/formatTimeline";
import {
    createTimelineRenderersSheduler,
    createTimelineRenderersTracktrace
} from "../components/scheduler/TimelineItemRenderer";
import {convertLines} from "../utils/scheduler/lines";


function TrackTracePage() {

    const navigate = useNavigate();

    const [selectDate, setSelectDate] = useState(new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0])

    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [startTimeLines, setStartTimeLines] = useState(undefined);
    const [timelineKey, setTimelineKey] = useState(0);
    const [visibleTimeRange, setVisibleTimeRange] = useState(null);
    const timelineRef = useRef();
    const [currentUnit, setCurrentUnit] = useState('hour');

    const [msg, setMsg] = useState("");
    const [isModalNotify, setIsModalNotify] = useState(false);



    useEffect(() => {
        fetchLines();
        // setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }, [])

    useEffect(() => {
        setPlanByHardware([])
        if (startTimeLines) {
            init(selectDate);
        }
    }, [selectDate])

    async function fetchLines() {
        try {
            const response = await SchedulerService.getLines();
            await setStartTimeLines(convertLines(response.data))
        } catch (e) {
            console.error(e)
            setMsg("Ошибка загрузки линий отчета: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }


    async function init(date) {
        try {
            setVisibleTimeRange(prevState => ({
                ...prevState,
                visibleTimeStart: moment(date).startOf('day').add(-2, 'hour'),
                visibleTimeEnd: moment(date).startOf('day').add(30, 'hour')
            }));

            const response = await SchedulerService.init(date);
            fetchPlan();


        } catch (e) {
            console.error(e)
            setMsg("Ошибка инициализации: " + e.response.data.error)
            setIsModalNotify(true);
            setItems([])
        }
    }

    async function fetchPlan() {
        try {
            const response = await SchedulerService.getPlan()
            setDownloadedPlan(response.data)

        } catch (e) {
            console.error(e)
            setDownloadedPlan([])
            setMsg("Ошибка получения плана: " + e.response.data.error)
            setIsModalNotify(true);
        }
    }

    useEffect(() => {
        displayByHardware()
    }, [planByHardware])

    function displayByHardware() {
        setGroups(hardware);
        setItems(planByHardware);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }

    useEffect(() => {
        if (downloadedPlan) {
            ScheduleService.parseHardware(downloadedPlan).then((e) => {
                setHardware(e);
                setGroups(e);
            });
            ScheduleService.parsePlanByHardware(downloadedPlan).then((e) => {
                setPlanByHardware(e);
                setItems(e);
            });
            SchedulerService.parseDateTimeSettings(downloadedPlan).then((e) => {
                setStartTimeLines(e)
            })
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }
    }, [downloadedPlan]);


    const handleTimeChange = useCallback((visibleTimeStart, visibleTimeEnd, updateScrollCanvas, unit, timelineContext) => {
        setVisibleTimeRange({
            visibleTimeStart,
            visibleTimeEnd,
            updateScrollCanvas
        });
        updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }, []);


    const handleZoom = useCallback((timelineContext) => {
        setCurrentUnit(timelineContext.timelineUnit);
    }, []);

    const timelineRenderers = useMemo(
        () => createTimelineRenderersTracktrace(),
        []
    );

    return (
        <>
            <div className="w-full">

                {/*{isModalInfoItem && selectedItem && <ModalInfoItem info={selectedItem.info} onClose={() => {*/}
                {/*    setSelectedItem(null);*/}
                {/*    setIsModalInfoItem(false);*/}
                {/*}} lines={groups}/>}*/}

                {/*{isLoading &&*/}
                {/*    <div className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center ">Загрузка</div>*/}
                {/*}*/}

                <div>
                    <h1 className=" font-bold text-center text-2xl mb-4 mt-4">Отслеживание плана производства</h1>
                </div>

                <div className="flex flex-row">
                    <div className="w-1/6 ">
                        <button onClick={() => {
                            navigate("/scheduler", {replace: true})
                        }} className=" ml-4 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
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
                                   onChange={(e) => setSelectDate(e.target.value)}
                            />
                        </div>



                    </div>

                    <div className="flex flex-row w-2/3 justify-between" style={{zIndex: 20}}>

                    </div>

                </div>

                <div className="m-4 border-x-2">
                    <Timeline
                        itemRenderer={timelineRenderers.itemRenderer}
                        groupRenderer={timelineRenderers.groupRenderer}
                        key={timelineKey}
                        groups={groups}
                        items={items}
                        // onItemDoubleClick={onItemDoubleClick}
                        // onItemContextMenu={handleItemRightClick}
                        // onItemSelect={onItemSelect}
                        // onCanvasContextMenu={handleCanvasRightClick}
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
                                // unit={currentUnit}
                                className=" font-medium text-sm "
                                labelFormat={formatTimelineLabel}
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    height: 30
                                }}
                            />


                            {/*{false &&*/}
                            {/*    <MyTimeline/>*/}
                            {/*}*/}
                        </TimelineHeaders>
                    </Timeline>
                </div>





                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}



            </div>
        </>
    )
}

export default observer(TrackTracePage)