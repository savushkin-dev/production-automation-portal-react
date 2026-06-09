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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                style={{ zIndex: 200 }}
            >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-white">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 flex-shrink-0">
                        <i className="fa-solid fa-triangle-exclamation text-red-600 text-lg"></i>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-red-800">{title}</h2>
                        <p className="text-xs text-red-500 mt-0.5">Произошла ошибка при выполнении операции</p>
                    </div>
                </div>

                <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
                    <div className="rounded-xl p-4">
                        <p className="text-sm text-red-700 leading-relaxed whitespace-pre-wrap break-words">
                            {message}
                        </p>
                    </div>
                </div>

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