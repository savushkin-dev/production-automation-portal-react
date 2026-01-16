import React from 'react'


export function ModalInfoItem({info, onClose, lines}) {

    const styleLable = "py-1 font-medium w-[25%] ";
    const styleInfo = "py-1 font-medium w-[75%] ";

    const isFact = info.startFact !== null;
    const isLinesMatch = info.lineIdFact === info.lineInfo.id;

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[700px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-medium text-start mb-2">{info.name}</h1>
                        <span>
                            {!isLinesMatch && isFact && info.name !== "Мойка" && !info.maintenance &&
                                <span className="font-medium align-middle text-red-600 pl-2">Фактическая линия не совпадает с планируемой<i
                                    className="pl-2 fa-solid fa-triangle-exclamation"></i></span>
                            }
                        </span>
                    </div>


                    <hr className="mb-3"/>

                    {info.name !== "Мойка" && !info.maintenance &&
                        <div className="">
                            <div className="flex flex-row bg-blue-800 rounded text-white px-4">
                                <span className={styleLable}>Наименование:</span>
                                <span className={styleInfo}>{info.fullName || "-"}</span>
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
                                <span className={styleInfo}>{info.snpz || "-"}</span>
                            </div>

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>№ партии:</span>
                                <span className={styleInfo}>{info.np || "-"}</span>
                            </div>

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Количество:</span>
                                <span className={styleInfo}>{info.quantity || "-"} шт.</span>
                            </div>

                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Масса:</span>
                                <span className={styleInfo}>{info.mass || "-"} кг.</span>
                            </div>
                        </div>
                    }

                    <div className="flex flex-row px-4">
                        <span className={styleLable}>Линия:</span>
                        <span className={styleInfo}>{info.line || "-"}</span>
                    </div>

                    {info.name !== "Мойка" && !info.maintenance && isFact &&
                        <div>
                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Линия по факту:</span>
                                <span className={styleInfo}>
                                    {lines.find(item => item.id === info.lineIdFact)?.title || "-"}
                                </span>
                            </div>
                        </div>
                    }

                    <div className="flex flex-row px-4">
                        <span className={styleLable}>Начало:</span>
                        <span className={styleInfo}>{info.start || "-"}</span>
                    </div>

                    {info.name !== "Мойка" && !info.maintenance && isFact &&
                        <div>
                            <div className="flex flex-row px-4">
                                <span className={styleLable}>Начало по факту:</span>
                                <span className={styleInfo}>{info.startFact || "-"}</span>
                            </div>
                        </div>
                    }

                    <div className="flex flex-row px-4">
                        <span className={styleLable}>Конец:</span>
                        <span className={styleInfo}>{info.end || ""}</span>
                    </div>

                    {info.maintenance &&
                        <div className="flex flex-row px-4">
                            <span className={styleLable}>Id:</span>
                            <span className={styleInfo}>{info.maintenanceId || "-"}</span>
                        </div>
                    }




                </div>
            </div>
        </>
    )
}