import React, {useEffect, useState} from 'react'
import ReportService from "../../services/ReportService";
import {styleInput, styleLabelInput} from "../../data/styles";
import {ModalNotify} from "../modal/ModalNotify";
import {ModalNotifyError} from "../modal/ModalNotifyError";
import {ModalConfirmation} from "../modal/ModalConfirmation";
import {CustomStyle} from "../../data/styleForSelect";
import CreatableSelect from "react-select/creatable";
import {WhiteButton} from "../reportsConstruct/buttons/WhiteButton";
import {BlueButton} from "../reportsConstruct/buttons/BlueButton";


export function ReportSetting({reportName, reportCategory, onClose, onUpdateReports}) {

    const [report, setReport] = useState({});

    const [isModalNotify, setIsModalNotify] = useState(false);
    const [isModalError, setIsModalError] = useState(false);
    const [isModalConfirmation, setIsModalConfirmation] = useState(false);
    const [modalMsg, setModalMsg] = useState("");

    const [isDelete, setIsDelete] = useState(false);

    const [optCategoryNames, setOptCategoryNames] = useState([]);
    const [selectCategory, setSelectCategory] = useState(null);


    useEffect(() => {
        fetchReportTemplate();
        fetchCategoryNames();
    }, [])


    async function fetchReportTemplate() {
        try {
            const response = await ReportService.getReportTemplateByReportName(reportName, reportCategory);
            setReport(response.data);

            if (response.data.reportCategory) {
                setSelectCategory({
                    value: response.data.reportCategory,
                    label: response.data.reportCategory
                });
            }
        } catch (e) {
            setModalMsg("Не удалось загрузить данные отчета. " + e.response.data.message);
            setIsModalError(true);
        }
    }

    async function applyChanges() {
        try {
            await ReportService.updateReportTemplate(report);
            setModalMsg("Шаблон отчета успешно обновлен.");
            setIsModalNotify(true);
            onUpdateReports();
        } catch (e) {
            setModalMsg("Не удалось обновить шаблон отчета. " + e.response.data.message);
            setIsModalError(true);
        }
    }

    async function deleteReportTemplate() {
        try {
            setIsModalConfirmation(false);
            await ReportService.deleteReportTemplate(report.id);
            setModalMsg("Шаблон отчета успешно удален.");
            setIsDelete(true);
            setIsModalNotify(true);
        } catch (e) {
            setModalMsg("Не удалось удалить шаблон отчета. " + e.response.data.message);
            setIsModalError(true);
        }
    }

    async function fetchCategoryNames() {
        try {
            const response = await ReportService.getCategories();
            const options = ReportService.convertCategoriesToOptions(response.data);
            setOptCategoryNames(options);
        } catch (error) {
            setModalMsg("Ошибка загрузки доступных отчетов! Попробуйте позже.")
            setIsModalError(true);
        }
    }

    function closeModalNotify(){
        setIsModalNotify(false);

        if(isDelete){
            onClose();
        }
    }

    function closeModalError(){
        setIsModalError(false);
    }

    function handleClickRemoveReport(){
        setModalMsg("Вы уверены что хотите удалить отчет: " + reportName + "?");
        setIsModalConfirmation(true);
    }


    return (
        <>
            {isModalNotify && <ModalNotify title={"Результат операции"} message={modalMsg} onClose={closeModalNotify}/>}
            {isModalError && <ModalNotifyError title={"Результат операции"} message={modalMsg} onClose={closeModalError}/>}

            {isModalConfirmation &&
                <ModalConfirmation title={"Результат операции"} message={modalMsg} onClose={()=> setIsModalConfirmation(false)}
                                   onDisagree={()=> setIsModalConfirmation(false)} onAgree={deleteReportTemplate}/>
            }

            {!isModalNotify && !isModalError && !isModalConfirmation &&
                <>
                    <div
                        className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                        onClick={onClose}
                    />
                    <div
                        className="w-full max-w-[500px] lg:w-[500px] p-5 z-30  rounded bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 animate-[scaleIn_0.3s_ease]"
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
                            <CreatableSelect
                                className="w-3/4"
                                placeholder="Введите текст для поиска..."
                                value={selectCategory}
                                onChange={(newValue) => {
                                    setSelectCategory(newValue);
                                    setReport(prevReport => ({
                                        ...prevReport,
                                        reportCategory: newValue ? newValue.value : ''
                                    }));
                                }}
                                styles={CustomStyle}
                                options={optCategoryNames}
                                isSearchable={true}
                                noOptionsMessage={() => "Отчеты не найдены"}
                                formatCreateLabel={(inputValue) => `${inputValue}`}
                                onCreateOption={(inputValue) => {
                                    setSelectCategory({ value: inputValue, label: inputValue });
                                    setReport(prevReport => ({
                                        ...prevReport,
                                        reportCategory: inputValue
                                    }));
                                }}
                            />
                        </div>


                        <div className="flex flex-row justify-between mt-2">

                            <button className="text-red-600 rounded hover:bg-red-50 px-2"
                                    onClick={handleClickRemoveReport}>Удалить отчет <i
                                className="fa-solid fa-trash-can"></i></button>

                            <div className="flex flex-row justify-end gap-2">
                                <WhiteButton onClick={onClose} text={"Закрыть"}/>
                                <BlueButton onClick={applyChanges} text={"Применить"}/>
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
            }

        </>
    )
}