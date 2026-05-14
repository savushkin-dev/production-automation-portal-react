import React, {useEffect, useState} from 'react'
import {isCleaningItem, isDelayItem, isFactItem, isPackagedItem} from "../../utils/scheduler/items";
import {formatIsoToDateOnly, formatIsoToDatetimeRegex} from "../../utils/date/date";
import SchedulerService from "../../services/ScheduleService";

export function ModalInfoItem({item, onClose, lines, determineFactPlace, determineCameraFact, clickedCameras, setClickedCameras,
                                  setModalError, setErrorMsg}) {

    const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
    const [downtimePeriods, setDowntimePeriods] = useState([])

    const styleLable = "py-1 font-medium w-[60%] ";
    const styleInfo = "py-1 font-medium w-[40%] ";

    const isFact = isPackagedItem(item);
    const isLinesMatch = item.info.lineIdFact === item.info.lineInfo.id;
    const isFactEl = isFactItem(item);

    async function clickFindCameraFact(){
        await determineCameraFact(item.info.snpz);
        setClickedCameras(prev => ({
            ...prev,
            [item.info.snpz]: true
        }));
    }

    useEffect(()=>{
        fetchDowntimePeriods();
    }, [])

    async function fetchDowntimePeriods() {
        try {
            const response = await SchedulerService.getDowntimePeriodsByIdBatch(item.info.idBatch)
            const repeated = [].concat(...Array(3).fill(response.data.downtime));
            setDowntimePeriods(repeated);
        } catch (e) {
            setErrorMsg("Не удалось получить список версий плана: " + e.response.data.message)
            setModalError(true);
        } finally {
            setIsLoadingPeriods(false);
        }
    }

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{zIndex: 100}}>
                <div className="w-auto min-w-[800px] max-w-[900px] bg-white rounded-lg p-5 px-8 pointer-events-auto">

                    {/* Заголовок */}
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-medium text-start mb-2">{item.info.name}</h1>
                        <span>
                            {!isLinesMatch && isFact && !isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance &&
                                <span className="font-medium align-middle text-red-600 pl-2">Фактическая линия не совпадает с планируемой<i
                                    className="pl-2 fa-solid fa-triangle-exclamation"></i></span>
                            }
                        </span>
                    </div>

                    <hr className="mb-3"/>

                    {/* Наименование */}
                    {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance &&
                        <div className="flex flex-row bg-blue-800 rounded text-white px-4">
                            <span className="py-1 font-medium w-[35%]">Наименование:</span>
                            <span className="py-1 font-medium w-[65%]">{item.info.fullName || "-"}</span>
                        </div>
                    }

                    <div className="flex">
                        {/* Левая часть */}
                        <div className="w-[60%]">
                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance &&
                                <div>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Статус:</span>
                                        <span className={styleInfo}>
                                            {isFact ? <span>Произведено</span> : <span>Запланировано</span>}
                                        </span>
                                    </div>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Snpz:</span>
                                        <span className={styleInfo}>{item.info.snpz || "-"}</span>
                                    </div>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Дата потребности:</span>
                                        <span className={styleInfo}>{formatIsoToDateOnly(item.info.dti) || "-"}</span>
                                    </div>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>№ партии:</span>
                                        <span className={styleInfo}>{item.info.np || "-"}</span>
                                    </div>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Количество:</span>
                                        <span className={styleInfo}>{item.info.quantity || "-"} шт.</span>
                                    </div>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Масса:</span>
                                        <span className={styleInfo}>{item.info.mass || "-"} кг.</span>
                                    </div>
                                </div>
                            }

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Линия по плану:</span>
                                <span className={styleInfo}>{item.info.line || "-"}</span>
                            </div>

                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && isFact &&
                                <div>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>{!isDelayItem(item) ? "Линия по факту:" : "Линия"}</span>
                                        <span className={styleInfo}>
                                            {lines.find(line => line.id === item.info.lineIdFact)?.title || "-"}
                                        </span>
                                    </div>
                                </div>
                            }

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>{!isDelayItem(item) ? "Начало по плану:" : "Начало:"}</span>
                                <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.start) || "-"}</span>
                            </div>

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>{!isDelayItem(item) ? "Конец по плану:" : "Конец:"}</span>
                                <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.end) || ""}</span>
                            </div>

                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && isFact &&
                                <div>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Начало по SCADA:</span>
                                        <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startFact) || "-"}</span>
                                    </div>
                                </div>
                            }

                            {item.info.maintenance &&
                                <div className="flex flex-row px-4">
                                    <span className={styleLable}>Описание:</span>
                                    <span className={styleInfo}>{item.info.maintenanceNote || "-"}</span>
                                </div>
                            }

                            {isDelayItem(item) &&
                                <div className="flex flex-row px-4">
                                    <span className={styleLable}>Описание:</span>
                                    <span className={styleInfo}>{item.info.delayNote || "-"}</span>
                                </div>
                            }

                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && isFact &&
                                <>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Начало по камере:</span>
                                        <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startCameraFact) || "-"}</span>
                                    </div>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Конец по камере:</span>
                                        <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.endCameraFact) || "-"}</span>
                                    </div>
                                </>
                            }

                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && !isFact &&
                                <>
                                    {!item.info.startCameraFact && !item.info.endCameraFact && !clickedCameras[item.info.snpz] &&
                                        <div className="flex flex-row px-4">
                                            <span className={styleLable}>Данные по камере:</span>
                                            <button onClick={() => clickFindCameraFact(item.info.snpz)}
                                                    className="h-6 bg-gray-600 font-medium rounded text-white px-2">Найти
                                            </button>
                                        </div>
                                    }
                                    {clickedCameras[item.info.snpz] &&
                                        <>
                                            <div className="flex flex-row px-4">
                                                <span className={styleLable}>Начало по камере:</span>
                                                <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startCameraFact) || "-"}</span>
                                            </div>
                                            <div className="flex flex-row px-4">
                                                <span className={styleLable}>Конец по камере:</span>
                                                <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.endCameraFact) || "-"}</span>
                                            </div>
                                        </>
                                    }
                                </>
                            }

                            {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance &&
                                <>
                                    <div className="flex flex-row px-4 items-center">
                                        <span className={styleLable}>Мест план:</span>
                                        <span className={styleInfo}>{item.info.placePlan || "-"}</span>
                                    </div>
                                    <div className="flex flex-row px-4 items-center">
                                        <span className={styleLable}>Мест факт:</span>
                                        {item.info.placeFactInfo &&
                                            <span className={styleInfo}>{item.info.placeFactInfo || "-"}</span>
                                        }
                                        {!item.info.placeFactInfo &&
                                            <button onClick={() => determineFactPlace(item.info.snpz)}
                                                    className="h-6 bg-gray-600 font-medium rounded text-white px-2">Найти</button>
                                        }
                                    </div>
                                </>
                            }
                        </div>

                        {/* Правая часть - простои */}
                        <div className="w-[40%] flex flex-col">
                            {item.info.idBatch &&
                                <>
                                    <h3 className="text-lg font-semibold py-3 px-1">Простои</h3>

                                    <div className="overflow-y-auto max-h-[400px]">
                                        <table className="w-full table-fixed">
                                            <thead className="sticky top-0 bg-white">
                                            <tr>
                                                <th className="w-1/12 px-2 py-1.5 text-left text-xs font-medium text-gray-700">№</th>
                                                <th className="w-4/12 px-2 py-1.5 text-left text-xs font-medium text-gray-700">Начало</th>
                                                <th className="w-4/12 px-2 py-1.5 text-left text-xs font-medium text-gray-700">Конец</th>
                                                <th className="w-3/12 px-2 py-1.5 text-left text-xs font-medium text-gray-700">Длит.</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y border-t divide-gray-200">
                                            {isLoadingPeriods ? (
                                                <tr>
                                                    <td colSpan="4" className="px-2 py-8 text-center">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 border-2 border-gray-300 border-t-blue-800 rounded-full animate-spin"></div>
                                                            <span
                                                                className="text-xs text-gray-500">Загрузка данных...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : downtimePeriods.length > 0 ? (
                                                downtimePeriods.map((period, index) => {
                                                    const start = new Date(period.dtStart);
                                                    const end = new Date(period.dtEnd);
                                                    const durationMs = end - start;
                                                    const hours = Math.floor(durationMs / 3600000);
                                                    const minutes = Math.floor((durationMs % 3600000) / 60000);

                                                    let durationText = '';
                                                    if (hours > 0) durationText += `${hours}ч `;
                                                    if (minutes > 0 || hours === 0) durationText += `${minutes}м`;
                                                    if (hours === 0 && minutes === 0) durationText = '0м';

                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-2 py-1.5 text-xs text-gray-700">{index + 1}</td>
                                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                                                {start.toLocaleString().slice(0, -3)}
                                                            </td>
                                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                                                {end.toLocaleString().slice(0, -3)}
                                                            </td>
                                                            <td className="px-2 py-1.5 text-xs text-gray-700">{durationText}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="4"
                                                        className="px-2 py-6 text-center text-xs text-gray-400">
                                                        Нет данных о простоях
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            }

                        </div>
                    </div>

                    {/* Подвал */}
                    {item.info.idBatch &&
                        <>
                            <hr className="my-3"/>
                            <div className="flex flex-row justify-end">
                                <span className="text-gray-500 text-xs">idBatch: {item.info.idBatch}</span>
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    )
}