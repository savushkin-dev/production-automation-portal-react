import React, {useEffect, useState} from 'react'
import {styleInputWithoutRounded} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";
import {convertHoursMinutesToMinutes, validateHours, validateMinutes} from "../../utils/scheduler/serviceWork";


export function ModalAssignServiceWork({
                                  onClose, assignServiceWork,
                                  selectedItems,
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
    const [insertIndex, setInsertIndex] = useState(1);
    const [isLastPos, setIsLastPos] = useState(false);
    const [time, setTime] = useState(new Date(selectDate).toISOString().replace(/T.*/, 'T08:00'));
    const [descriptionOperation, setDescriptionOperation] = useState("");
    const [selectService, setSelectService] = useState(optServiceTypes[0]);

    const [hour, setHour] = useState(1);
    const [min, setMin] = useState(0);

    const [isAddingEmptyLine, setIsAddingEmptyLine] = useState(false);

    const getLastItemIndexInGroup = (groupId) => {
        // Фильтруем элементы по группе и ИСКЛЮЧАЕМ мойки
        const groupItems = planByHardware
            .filter(item => item.group === groupId && !item.id.includes('cleaning'))
            .sort((a, b) => a.start_time - b.start_time);

        if (groupItems.length === 0) {
            return -1; // Группа пустая
        }

        // Возвращаем индекс последнего элемента (без учета моек)
        return groupItems.length - 1;
    };

    function assign() {
        assignServiceWork(selectLine.value, insertIndex - 1, time, getTotalMinutes(), selectService.value, descriptionOperation, isAddingEmptyLine);
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
            if (isLastPos) {
                setInsertIndex(getLastItemIndexInGroup(event.value) + 2)
            }
        } else {
            setSelectLine(optLines[1]);
            if (isLastPos) {
                setInsertIndex(getLastItemIndexInGroup(optLines[1].value) + 2)
            }
        }
    };

    const handleChangeSelectService = (event) => {
        event != null ? setSelectService(event) : setSelectService(optServiceTypes[1]);
    };

    useEffect(()=>{
        const hasJobsOnLine = planByHardware.some(job => job.group === selectLine.value);
        if (hasJobsOnLine) {
            setIsAddingEmptyLine(false)
        } else {
            setIsAddingEmptyLine(true)
        }
    }, [selectLine])

    const handleChangeInsertIndex = (event) => {
        setInsertIndex(event)
    };

    const handleChangeIsLastPos = (event) => {
        setIsLastPos(event)
        if (event === true) {
            setInsertIndex(getLastItemIndexInGroup(selectLine.value) + 2)
        }
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[600px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Добавление сервисной операции</h1>
                    <hr/>

                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/2">Выберите линию:</span>
                        <Select className=" ml-4 py-1 font-medium text-md w-1/2"
                                value={selectLine}
                                onChange={handleChangeSelectLine}
                                styles={CustomStyle}
                                options={optLines}
                                isClearable={false} isSearchable={false}/>
                    </div>
                    {!isAddingEmptyLine &&
                        <div className="flex flex-row my-2">
                            <span className="py-1 font-medium w-1/2">На какую позицию добавить:</span>
                            <div className="w-1/2 flex flex-row">
                                <div style={{display: 'flex', alignItems: 'center'}}
                                     className="font-medium w-[100%] ml-2">
                                    <input className={styleInputWithoutRounded + "rounded w-[100%]"}
                                           type="number"
                                           min={0}
                                           value={insertIndex}
                                           onChange={(e) => handleChangeInsertIndex(e.target.value)}
                                           style={{
                                               paddingRight: '50%',
                                           }}
                                    />
                                    <span className="text-sm" style={{
                                        marginLeft: '-80px',
                                        cursor: 'pointer',
                                    }}>
                                        В конец
                                    </span>
                                    <input className={styleInputWithoutRounded}
                                           type="checkbox"
                                           checked={isLastPos}
                                           onChange={(e) => handleChangeIsLastPos(e.target.checked || "")}
                                           style={{
                                               marginLeft: '5px',
                                               cursor: 'pointer',
                                           }}
                                    />

                                </div>
                            </div>
                        </div>
                    }
                    {isAddingEmptyLine &&
                        <div className="flex flex-row my-2">
                            <span className="py-1 font-medium w-1/2">Начало сервисной операции:</span>
                            <div className="w-1/2 flex flex-row">
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
                    }

                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/2">Длительность операции:</span>

                        <div className="ml-4 w-1/2 flex flex-row">
                            <input min={0} className={styleInputWithoutRounded + "rounded w-[54px]"}
                                   type="number"
                                   value={hour}
                                   onChange={(e) => onChangeHour(e.target.value)}
                            />
                            <span className=" py-1 font-medium text-center w-[30px]">ч.</span>
                            <input min={0} max={59} className={styleInputWithoutRounded + "rounded w-[54px]"}
                                   type="number"
                                   value={min}
                                   onChange={(e) => onChangeMin(e.target.value)}
                            />
                            <span className="py-1 font-medium text-center w-[40px]">мин.</span>
                        </div>

                    </div>
                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/2">Выберите операцию:</span>
                        <Select className=" ml-4 py-1 font-medium text-md w-1/2"
                                value={selectService}
                                onChange={handleChangeSelectService}
                                styles={CustomStyle}
                                options={optServiceTypes}
                                isClearable={false} isSearchable={false}/>
                    </div>
                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/2">Описание (опционально):</span>
                        <textarea className={styleInputWithoutRounded + " h-[68px] rounded ml-4 w-1/2"}
                               value={descriptionOperation}
                               onChange={(e) => setDescriptionOperation(e.target.value)}
                        />
                    </div>


                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Отмена
                            </button>
                            <button onClick={() => {
                                assign();
                                onClose()
                            }}
                                    className="min-w-[50px] text-xs h-7 font-medium px-2 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                                Применить
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}