import React from 'react'


export function ModalDateSettings({lines, setLines, onClose,  idealEndDateTime, setIdealEndDateTime,
                                  changeTime, changeMaxEndTime}) {

    const styleLable = "py-1 font-medium w-2/3 ";
    const styleInfo = "py-1 font-medium w-1/3 ";

    const handleTimeChange = (lineId, newTime) => {
        setLines(prevLines =>
            prevLines.map(line =>
                line.id === lineId
                    ? {...line, startDateTime: newTime}
                    : line
            )
        );

        const line = lines.find(item => item.id === lineId)?.lineId;
        changeTime(line, newTime);
    };

    const handleMaxTimeChange = (lineId, newTime) => {
        setLines(prevLines =>
            prevLines.map(line =>
                line.id === lineId
                    ? {...line, maxEndDateTime: newTime}
                    : line
            )
        );

        const line = lines.find(item => item.id === lineId)?.lineId;
        changeMaxEndTime(line, newTime);
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[800px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Настройки даты и времени планировщика</h1>
                    <hr/>

                    <div className="my-3 ">
                        <div className="flex flex-row w-full bg-blue-800 rounded text-white justify-between">
                            <span className="w-[30%] py-1 px-2 font-medium pl-14">Линия</span>
                            <span className="w-[35%] py-1 px-2 font-medium text-center">Время начала</span>
                            <span className="w-[35%] py-1 px-2 font-medium text-center">Максимальное время</span>
                        </div>
                        {lines.map((line, index) => (
                            <div key={index} className="flex flex-row justify-between py-1 border-b">
                                <div  className="flex flex-row w-[30%] px-5">
                                    <span className="py-1 font-medium ">{line.name}:</span>
                                </div>

                                <div  className="flex flex-row w-[35%] justify-center">
                                    <input className="py-1 px-2 font-medium " type={"datetime-local"}
                                           value={line.startDateTime}
                                           onChange={(e) => handleTimeChange(line.id, e.target.value)}
                                    />
                                </div>
                                <div  className="flex flex-row w-[35%] justify-center">

                                    <input className="py-1 px-2 font-medium " type={"datetime-local"}
                                           value={line.maxEndDateTime}
                                           onChange={(e) => handleMaxTimeChange(line.id, e.target.value)}
                                    />
                                </div>

                            </div>

                        ))}
                    </div>

                    <div className="flex flex-row my-2 hidden">
                        <span className={styleLable}>Идеальное время выполнения расчета:</span>
                        <input className={styleInfo} type={"datetime-local"}
                               value={idealEndDateTime}
                               onChange={(e) => setIdealEndDateTime(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Закрыть
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}