import React, {useEffect, useState} from 'react'
import {styleInputWithoutRounded} from "../../data/styles";
import {
    convertHoursMinutesToMinutes,
    convertMinutesToHoursMinutes,
    validateHours,
    validateMinutes
} from "../../utils/scheduler/serviceWork";


export function ModalUpdateServiceWork({onClose, selectedItems, updateServiceWork}) {

    const [hour, setHour] = useState(0);
    const [min, setMin] = useState(0);

    function update() {
        const firstItem = selectedItems[0];
        const index = firstItem.info.groupIndex-1;
        const line = firstItem.group;
        const totalMinutes = convertHoursMinutesToMinutes(hour, min)
        updateServiceWork(line, index, totalMinutes)
    }

    useEffect(()=>{
        const { hours, minutes } = convertMinutesToHoursMinutes(selectedItems[0].info.duration);
        setHour(hours);
        setMin(minutes);
    }, [])

    function onChangeHour(e) {
        const validatedValue = validateHours(e, 99);
        setHour(validatedValue);
    }

    function onChangeMin(e) {
        const validatedValue = validateMinutes(e, 59);
        setMin(validatedValue);
    }

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[500px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Изменение длительности сервисной операции</h1>
                    <hr/>

                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/2">Длительность операции:</span>

                        <div className="ml-4 w-1/2 flex flex-row justify-end">
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

                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Отмена
                            </button>
                            <button onClick={() => {
                                update();
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