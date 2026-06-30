import React from 'react'
import {BlueButton} from "../reportsConstruct/buttons/BlueButton";


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
                    <div className="flex flex-row justify-end items-center bg-white my-2 gap-2">
                        <BlueButton onClick={onClose} text={"ОК"}/>
                    </div>
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