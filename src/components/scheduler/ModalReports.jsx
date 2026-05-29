import React, {useState} from 'react'
import {GrayButton} from "./buttons/GrayButton";
import SchedulerService from "../../services/ScheduleService";

export function ModalReports({onClose, setModalError, setErrorMsg}) {

    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    const createExportHandler = (serviceMethod, reportName) => {
        return async () => {
            try {
                const response = await serviceMethod(dateFrom, dateTo);

                const blob = response.data;
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${reportName}_${dateFrom}_${dateTo}.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);

            } catch (e) {
                setErrorMsg(`Не удалось экспортировать ${reportName}: ${e.response?.data?.message || e.message}`);
                setModalError(true);
            }
        };
    };

    const exportCleaningReport = createExportHandler(
        SchedulerService.getCleaningReport.bind(SchedulerService),
        'cleaning_report'
    );

    const exportUserLogReport = createExportHandler(
        SchedulerService.getUserLogReport.bind(SchedulerService),
        'user_log_report'
    );


    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{zIndex: 99}}
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-100 pointer-events-none" style={{zIndex: 100}}>
                <div
                    className="w-[620px] bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200">

                    <div
                        className="relative px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                        <div className="pr-8">
                            <h2 className="text-xl font-bold text-slate-800">Экспорт отчетов</h2>
                            <p className="text-sm text-slate-500 mt-1">Выберите период за который вы хотите получить отчет и экспортируйте</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div className="py-3 flex flex-row items-center justify-center gap-3">
                        <div className="flex flex-row justify-center">
                            <span className=" py-1 px-2 font-medium text-center text-gray-800">Дата начала</span>
                            <input className="py-1 px-2 font-medium text-gray-800" type={"date"}
                                   value={dateFrom}
                                   onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-row  justify-center">
                            <span className=" py-1 px-2 font-medium text-center text-gray-800">Дата конца</span>
                            <input className="py-1 px-2 font-medium text-gray-800" type={"date"}
                                   value={dateTo}
                                   onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                    </div>



                    <div className="px-14 pt-6 pb-3 flex flex-col gap-3">

                        <button onClick={exportCleaningReport}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                            Экспортировать отчет по мойкам
                        </button>

                        <button onClick={exportUserLogReport}
                                className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600">
                            Экспортировать отчет по простоям
                        </button>

                    </div>

                    <hr className="mt-4"/>

                    <div className="flex flex-row justify-end gap-2 my-4 px-6">
                        <GrayButton text={"Закрыть"} onClick={onClose} className={""}/>
                    </div>

                </div>
            </div>
        </>
    )
}