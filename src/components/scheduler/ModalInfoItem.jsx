import React from 'react'


export function ModalInfoItem({info, onClose}) {

    const styleLable = "py-1 font-medium w-1/5 ";
    const styleInfo = "py-1 font-medium w-4/5 ";
    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[700px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">{info.name}</h1>
                    <hr/>

                    <div className="flex flex-row">
                        <span className={styleLable}>Наименование:</span>
                        <span className={styleInfo}>{info.fullName || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>№ партии:</span>
                        <span className={styleInfo}>{info.np || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>Тип:</span>
                        <span className={styleInfo}>{info.type || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>Количество:</span>
                        <span className={styleInfo}>{info.quantity || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>Линия:</span>
                        <span className={styleInfo}>{info.line || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>Начало:</span>
                        <span className={styleInfo}>{info.start || "-"}</span>
                    </div>

                    <div className="flex flex-row">
                        <span className={styleLable}>Конец:</span>
                        <span className={styleInfo}>{info.end || ""}</span>
                    </div>


                </div>
            </div>
        </>
    )
}