import React, {useEffect, useState} from 'react'
import ReportService from "../../services/ReportService";
import {styleInput, styleLabelInput} from "../../data/styles";
import {ModalNotify} from "../modal/ModalNotify";
import {ModalNotifyError} from "../modal/ModalNotifyError";


export function ReportSetting({reportName, onClose}) {

    const [report, setReport] = useState({});

    const [isModalNotify, setIsModalNotify] = useState(false);
    const [modalMsg, setModalMsg] = useState("");

    const [isDelete, setIsDelete] = useState(false);


    useEffect(() => {
        fetchReportTemplate()
    }, [])


    async function fetchReportTemplate() {
        try {
            const response = await ReportService.getReportTemplateByReportName(reportName);
            setReport(response.data)
        } catch (e) {
            setModalMsg("Не удалось загрузить данные отчета.");
            setIsModalNotify(true);
        }
    }

    async function applyChanges() {
        try {
            await ReportService.updateReportTemplate(report);
            setModalMsg("Шаблон отчета успешно обновлен.");
        } catch (e) {
            setModalMsg("Не удалось обновить шаблон отчета, попробуйте еще раз.");
        } finally {
            setIsModalNotify(true);
        }
    }

    async function deleteReportTemplate() {
        try {
            await ReportService.deleteReportTemplate(report.id);
            setModalMsg("Шаблон отчета успешно удален.");
            setIsDelete(true);
        } catch (e) {
            setModalMsg("Не удалось удалить шаблон отчета, попробуйте еще раз.");
        } finally {
            setIsModalNotify(true);
        }
    }

    function closeModalNotify(){
        setIsModalNotify(false);

        if(isDelete){
            onClose();
        }
    }

    return (
        <>
            {isModalNotify && <ModalNotifyError title={"Результат операции"} message={modalMsg} onClose={closeModalNotify}/>}

            {!isModalNotify &&
                <>
                    <div
                        className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                        onClick={onClose}
                    />
                    <div
                        className="w-full max-w-[500px] lg:w-[500px] p-5 z-30  rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8"
                    >
                        <h1 className="text-xl font-medium text-start mb-4">Редактирование отчета</h1>

                        <div className="flex flex-row items-center pb-4">
                            <span className={styleLabelInput + "w-1/4 mr-2"}>Наименование</span>
                            <input
                                className={styleInput + "w-3/4"}
                                value={report.reportName || ""}
                                onChange={(e) => {
                                    setReport(prevReport => ({
                                        ...prevReport,
                                        reportName: e.target.value
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-row items-center pb-4">
                            <span className={styleLabelInput + "w-1/4 mr-2"}>Категория</span>
                            <input
                                className={styleInput + "w-3/4"}
                                value={report.reportCategory || ""}
                                onChange={(e) => {
                                    setReport(prevReport => ({
                                        ...prevReport,
                                        reportCategory: e.target.value
                                    }));
                                }}
                            />
                        </div>


                        <div className="flex flex-row justify-between mt-2">

                            <button className="text-red-600 rounded hover:bg-red-50 px-2"
                                    onClick={deleteReportTemplate}>Удалить отчет <i
                                className="fa-solid fa-trash-can"></i></button>

                            <div className="flex flex-row justify-end">
                                <button
                                    onClick={onClose}
                                    className="min-w-[50px] px-2 mr-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                    Закрыть
                                </button>
                                <button onClick={applyChanges}
                                        className=" px-2 h-7  rounded text-xs font-medium shadow-sm border  bg-blue-800 hover:bg-blue-700 text-white">
                                    Применить
                                </button>
                            </div>
                        </div>


                    </div>

                </>
            }

        </>
    )
}