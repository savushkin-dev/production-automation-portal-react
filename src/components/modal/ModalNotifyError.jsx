import React from 'react'


export function ModalNotifyError({title, message, onClose}) {
    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30  rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8"
                style={{zIndex: 100}}
            >
                <div className="flex flex-row justify-start mb-2">
                    <h1 className="text-xl font-medium text-start ">{title}</h1>
                    <span className="text-red-600 pr-2 h-[20px] mt-1 ml-2 w-[20px]">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="my-3 text-red-600 font-medium">{message}</span>
                    <button onClick={onClose}
                            className="w-14 px-2 h-7 self-end my-2 rounded text-sm font-medium shadow-sm border bg-blue-800 hover:bg-blue-700 text-white">
                        ОК
                    </button>
                </div>

            </div>
        </>
    )
}