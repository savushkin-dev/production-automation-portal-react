import React from 'react'

export function ModalNotifyError({ title, message, onClose }) {
    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200"
                style={{ zIndex: 199 }}
                onClick={onClose}
            />
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                style={{ zIndex: 200 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 ">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                        <i className="fa-solid fa-triangle-exclamation text-red-600 text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-red-800">{title}</h2>
                        <p className="text-xs text-red-500 mt-0.5">Произошла ошибка при выполнении операции</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <div className=" rounded-xl p-4 border-red-100">
                        <p className="text-sm text-red-700 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </>
    )
}