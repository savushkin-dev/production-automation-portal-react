import React, {useState} from 'react'
import {styleInputWithoutRounded} from "../../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../../data/styleForSelect";
import {convertHoursMinutesToMinutes, validateHours, validateMinutes} from "../../../utils/scheduler/serviceWork";
import {calculateTimeToNext8AM, getLastItemInGroup} from "../../../utils/scheduler/items";
import {GrayButton} from "../buttons/GrayButton";
import {BlueButton} from "../buttons/BlueButton";


export function ModalAddParallelOperation({
                                              onClose, addParallelOperation,
                                              planByHardware,
                                              lines, selectDate, serviceTypes
                                          }) {

    const optLines = lines.map(line => ({
        value: line.lineId,
        label: line.originalName
    }));

    const optServiceTypes = serviceTypes.map(service => ({
        value: service.id,
        label: service.name
    }));

    const [selectLine, setSelectLine] = useState(optLines[0]);
    const [time, setTime] = useState(new Date(selectDate).toISOString().replace(/T.*/, 'T08:00'));
    const [descriptionOperation, setDescriptionOperation] = useState("");
    const [selectService, setSelectService] = useState(optServiceTypes[0]);

    const [hour, setHour] = useState(1);
    const [min, setMin] = useState(0);


    function assign() {
        addParallelOperation(selectLine.value, time, getTotalMinutes(), selectService.value, descriptionOperation);
    }

    const getTotalMinutes = () => {
        return convertHoursMinutesToMinutes(hour, min);
    };

    function onChangeHour(e) {
        const validatedValue = validateHours(e, 99);
        setHour(validatedValue);
    }

    function onChangeMin(e) {
        const validatedValue = validateMinutes(e, 59);
        setMin(validatedValue);
    }

    const handleChangeSelectLine = (event) => {
        if (event != null) {
            setSelectLine(event);
        } else {
            setSelectLine(optLines[1]);
        }
    };

    const handleChangeSelectService = (event) => {
        event != null ? setSelectService(event) : setSelectService(optServiceTypes[1]);
    };


    const handleChangeFillingVoids = (event) => {
        let res = getLastItemInGroup(selectLine.value, planByHardware)
        if (!res) {
            setHour(24)
            setMin(0)
            return
        }
        res = calculateTimeToNext8AM(res.info.end)
        setHour(res.hours)
        setMin(res.minutes)
    };


    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[700px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Добавление параллельной сервисной операции</h1>
                    <hr/>

                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/3">Выберите линию:</span>
                        <Select className=" ml-4 py-1 font-medium text-md w-2/3"
                                value={selectLine}
                                onChange={handleChangeSelectLine}
                                styles={CustomStyle}
                                options={optLines}
                                isClearable={false} isSearchable={false}/>
                    </div>


                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/3">Начало сервисной операции:</span>
                        <div className="w-2/3 flex flex-row">
                            <div style={{display: 'flex', alignItems: 'center'}}
                                 className="font-medium w-[100%] ml-2">
                                <input className={styleInputWithoutRounded + "rounded w-[100%]"}
                                       type="datetime-local"
                                       min={0}
                                       value={time}
                                       onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/3">Длительность операции:</span>

                        <div className="ml-4 w-2/3 flex flex-row justify-between">
                            <div>
                                <input min={0} className={styleInputWithoutRounded + "rounded w-[54px]"}
                                       type="number"
                                       value={hour}
                                       onChange={(e) => onChangeHour(e.target.value)}
                                />
                                <span className=" py-1 font-medium text-center w-[30px] px-1">ч.</span>
                                <input min={0} max={59} className={styleInputWithoutRounded + "rounded w-[54px]"}
                                       type="number"
                                       value={min}
                                       onChange={(e) => onChangeMin(e.target.value)}
                                />
                                <span className="py-1 font-medium text-center w-[40px] px-1">мин.</span>
                            </div>

                            <button
                                onClick={handleChangeFillingVoids}
                                className=" text-xs h-7 font-medium px-2 py-1 rounded text-white bg-gray-700 hover:bg-gray-600">Определить
                                время до
                                08:00
                            </button>
                        </div>

                    </div>
                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/3">Выберите операцию:</span>
                        <Select className=" ml-4 py-1 font-medium text-md w-2/3"
                                value={selectService}
                                onChange={handleChangeSelectService}
                                styles={CustomStyle}
                                options={optServiceTypes}
                                isClearable={false} isSearchable={false}/>
                    </div>
                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/3">Описание (опционально):</span>
                        <textarea className={styleInputWithoutRounded + " h-[68px] rounded ml-4 w-2/3"}
                                  value={descriptionOperation}
                                  onChange={(e) => setDescriptionOperation(e.target.value)}
                        />
                    </div>


                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2 gap-2">
                            <GrayButton text={"Отмена"} onClick={onClose}/>
                            <BlueButton text={"Применить"} onClick={() => {
                                assign();
                                onClose()
                            }} className={""}/>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}