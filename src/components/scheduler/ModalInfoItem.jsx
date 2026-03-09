import React, {useEffect} from 'react'
import {isCleaningItem, isDelayItem, isFactItem, isPackagedItem} from "../../utils/scheduler/items";
import {formatIsoToDateOnly, formatIsoToDatetimeRegex} from "../../utils/date/date";



export function ModalInfoItem({item, onClose, lines, determineFactPlace, determineCameraFact, clickedCameras, setClickedCameras}) {

    const styleLable = "py-1 font-medium w-[35%] ";
    const styleInfo = "py-1 font-medium w-[65%] ";

    const isFact = isPackagedItem(item);
    const isLinesMatch = item.info.lineIdFact === item.info.lineInfo.id;
    const isFactEl = isFactItem(item);

    async function clickFindCameraFact(){
        await determineCameraFact(item.info.snpz);

        // Устанавливаем флаг что кнопка была нажата для этого snpz
        setClickedCameras(prev => ({
            ...prev,
            [item.info.snpz]: true
        }));
    }

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[800px] max-w-[900px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
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

                    {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance &&
                        <div className="">
                            <div className="flex flex-row bg-blue-800 rounded text-white px-4">
                                <span className={styleLable}>Наименование:</span>
                                <span className={styleInfo}>{item.info.fullName || "-"}</span>
                            </div>

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Статус:</span>
                                <span className={styleInfo}>
                                    {isFact ? (
                                        <span>Произведено</span>
                                    ) : (
                                        <span>Запланировано</span>
                                    )}
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
                                <span className={styleLable}>Линия по факту:</span>
                                <span className={styleInfo}>
                                    {lines.find(line => line.id === item.info.lineIdFact)?.title || "-"}
                                </span>
                            </div>
                        </div>
                    }

                    <div className="flex flex-row px-4">
                        <span className={styleLable}>Начало по плану:</span>
                        <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.start) || "-"}</span>
                    </div>

                    {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && isFact &&
                        <div>
                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Начало по факту:</span>
                                <span
                                    className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startFact) || "-"}</span>
                            </div>
                        </div>
                    }

                    <div className="flex flex-row px-4">
                        <span className={styleLable}>Конец по плану:</span>
                        <span className={styleInfo}>{formatIsoToDatetimeRegex(item.info.end) || ""}</span>
                    </div>

                    {item.info.maintenance &&
                        <div className="flex flex-row px-4">
                            <span className={styleLable}>Описание:</span>
                            <span className={styleInfo}>{item.info.maintenanceNote || "-"}</span>
                        </div>
                    }

                    {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && isFact &&
                        <>
                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Начало по камере:</span>
                                <span
                                    className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startCameraFact) || "-"}</span>
                            </div>
                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Конец по камере:</span>
                                <span
                                    className={styleInfo}>{formatIsoToDatetimeRegex(item.info.endCameraFact) || "-"}</span>
                            </div>
                        </>
                    }

                    {!isCleaningItem(item) && !isDelayItem(item) && !item.info.maintenance && !isFact &&
                        <>
                            {!item.info.startCameraFact && !item.info.endCameraFact && !clickedCameras[item.info.snpz] &&
                                <>

                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Данные по камере:</span>
                                        <button onClick={() => clickFindCameraFact(item.info.snpz)}
                                                className="h-6 bg-gray-600 font-medium  rounded text-white px-2">Найти
                                        </button>
                                    </div>
                                </>
                            }
                            {clickedCameras[item.info.snpz] &&
                                <>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Начало по камере:</span>
                                        <span
                                            className={styleInfo}>{formatIsoToDatetimeRegex(item.info.startCameraFact) || "-"}</span>
                                    </div>
                                    <div className="flex flex-row px-4">
                                        <span className={styleLable}>Конец по камере:</span>
                                        <span
                                            className={styleInfo}>{formatIsoToDatetimeRegex(item.info.endCameraFact) || "-"}</span>
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
                                            className="h-6 bg-gray-600 font-medium  rounded text-white px-2">Найти</button>
                                }
                            </div>
                        </>
                    }


                </div>
            </div>
        </>
    )
}