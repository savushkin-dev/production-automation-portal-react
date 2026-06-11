import React from 'react'


export function ModalNotify({title, message, onClose}) {
    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0" style={{zIndex: 199}}
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30  rounded bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 animate-[scaleIn_0.3s_ease]"
                style={{zIndex: 200}}
            >
                <h1 className="text-xl font-medium text-start mb-2">{title}</h1>
                <div className="flex flex-col">
                    <span className="my-3 ">{message}</span>
                    <button onClick={onClose}
                            className="w-14 px-2 h-7 self-end  my-2 rounded text-sm font-medium shadow-sm border  bg-blue-800 hover:bg-blue-700 text-white">
                        ОК
                    </button>
                </div>

            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: translate(-50%, -50%) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    )
}