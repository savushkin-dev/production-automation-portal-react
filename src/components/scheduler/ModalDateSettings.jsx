import React from 'react'


export function ModalDateSettings({lines, setLines, selectDate, setDate, selectEndDate, setSelectEndDate,
                                      onClose, apply, idealEndDateTime, setIdealEndDateTime, maxEndDateTime, setMaxEndDateTime}) {

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
                    <h1 className="text-xl font-medium text-start mb-2">Настройки даты и времени планировщика</h1>
                    <hr/>

                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium">Дата начала плана:</span>
                        <input className={"px-2 ml-4 py-1 font-medium"} type="date"
                               value={selectDate}
                               onChange={(e) => setDate(e.target.value)}
                        />
                        <span className="py-1 font-medium">Дата конца плана:</span>
                        <input className={"px-2 ml-4 py-1 font-medium"} type="date"
                               value={selectEndDate}
                               onChange={(e) => setSelectEndDate(e.target.value)}
                        />
                    </div>

                    <div className="grid my-3 grid-cols-2 gap-x-8 gap-y-2">
                        {lines.map((line, index) => (
                            <div key={index} className="flex flex-row">
                                <span className={styleLable}>{line.name}:</span>
                                <input className={styleInfo} type={"time"}
                                       value={line.startDateTime}
                                       onChange={(e) => handleTimeChange(line.id, e.target.value)}
                                />
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

                    <div className="flex flex-row mb-2">
                        <span className={styleLable}>Максимальное время выполнения расчета:</span>
                        <input className={styleInfo} type={"datetime-local"}
                            value={maxEndDateTime}
                            onChange={(e) => {
                                console.log(e.target.value)
                                setMaxEndDateTime(e.target.value)
                            }}
                        />
                    </div>


                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Отмена
                            </button>
                            <button onClick={() => {apply(); onClose()}}
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