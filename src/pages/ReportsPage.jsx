import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useEffect, useState, useContext} from "react";
import ReportService from "../services/ReportService";
import Loading from "../components/loading/Loading";
import {useNavigate} from "react-router-dom";
import RoleGuard from "../components/RoleGuard";
import {ReportSetting} from "../components/report/ReportSetting";
import {ModalParameterWithLayout} from "../components/reportsConstruct/ModalParameterWithLayout";
import {ModalNotifyError} from "../components/modal/ModalNotifyError";
import {Context} from '../index';
import {observer} from 'mobx-react-lite';


function ReportsPage() {

    const navigate = useNavigate();
    const {store} = useContext(Context);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalError, setIsModalError] = useState(false);
    const [isModalParameter, setIsModalParameter] = useState(false);
    const [isModalSettings, setIsModalSettings] = useState(false);

    const [reportsName, setReportsName] = useState([]);
    const [selectName, setSelectName] = useState("unknown")
    const [selectCategory, setSelectCategory] = useState("unknown")
    const [parametersMeta, setParametersMeta] = useState([]);
    const [paramLayout, setParamLayout] = useState([]);


    async function fetchReportsName() {
        try {
            setIsLoading(true);
            const response = await ReportService.getReportsNameGroupCategory();
            const sortedData = sortReportsData(response.data);
            setReportsName(sortedData);
        } catch (e) {
            setIsModalError(true);
            setError(e.response.data.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchParametersMeta(reportName, reportCategory) {
        try {
            const response = await ReportService.getParametersMetaByReportName(reportName, reportCategory);
            setParametersMeta(JSON.parse(response.data.parameters));
            setParamLayout(JSON.parse(response.data.layoutParams));
        } catch (e) {
            setIsModalError(true);
            setError(e.response.data.message);
        }
    }

    useEffect(() => {
        fetchReportsName();
    }, []);


    async function handleReportClick(reportName, reportCategory) {
        await fetchParametersMeta(reportName, reportCategory);
        setSelectName(reportName);
        setSelectCategory(reportCategory);
        setIsModalParameter(true);
    }

    async function handleReportEditClick(reportName, reportCategory){
        setSelectName(reportName);
        setSelectCategory(reportCategory)
        setIsModalSettings(true);
    }


    async function onSubmitParameters(parameters) {
        setIsModalParameter(false);
        const encodedParams = encodeURIComponent(JSON.stringify(parameters));
        const url = `/report?name=${selectName}&category=${selectCategory}&params=${encodedParams}`;
        navigate(url);
    }

    async function closeReportSettings(){
        setIsModalSettings(false);
        await fetchReportsName();
    }

    // Проверка, может ли пользователь видеть категорию "В разработке"
    const canSeeDevelopment = () => {
        return store.isAuth && store.hasAnyRole(['ROLE_ADMIN', 'ROLE_EDITOR']);
    };

    // Функция для сортировки данных
    function sortReportsData(data) {
        if (!data || !Array.isArray(data)) return [];

        // Фильтруем категории
        let filteredData = data
            .filter(item => item?.category)
            .map(category => ({
                ...category,
                category: category.category.trim(),
                reports: [...(category.reports || [])]
                    .filter(report => report)
                    .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }))
            }));

        // Если пользователь не администратор и не редактор, скрываем категорию "В разработке"
        if (!canSeeDevelopment()) {
            filteredData = filteredData.filter(item => item.category !== 'В разработке');
        }

        // Разделяем категории: "В разработке" и остальные
        const developmentCategory = filteredData.find(item => item.category === 'В разработке');
        const otherCategories = filteredData.filter(item => item.category !== 'В разработке');

        // Сортируем остальные категории по алфавиту
        const sortedOtherCategories = otherCategories.sort((a, b) =>
            a.category.localeCompare(b.category, 'ru', { numeric: true })
        );

        // Формируем результат: сначала "В разработке" (если есть), потом остальные
        const result = [];
        if (developmentCategory) {
            result.push(developmentCategory);
        }
        result.push(...sortedOtherCategories);

        return result;
    }

    return (<>

        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
        }}/>
        <div className="flex flex-row window-height">
            <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>
            <div className="flex flex-col w-full">

                {isLoading && <Loading/>}

                {!isLoading && <>
                    <div className="px-24 py-16">
                        <span className="text-2xl font-bold">Сервер отчётов АСУТП</span>
                    </div>

                    <div className="px-24 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {reportsName.map((option, index) => (
                                <div key={index} className="border rounded-lg p-3">

                                    <span className={`block w-full px-2 rounded shadow-inner ${
                                        option.category === 'В разработке'
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-blue-800 text-white'
                                    }`}>
                                        {option.category}
                                    </span>

                                    <div className="mt-2 ">
                                        {option.reports.map((reportName, reportIndex) => (
                                            <div key={reportIndex} className="flex flex-row rounded hover:bg-blue-50">

                                                <button
                                                    key={reportIndex}
                                                    onClick={() => handleReportClick(reportName, option.category)}
                                                    className="block w-full my-1 px-2 text-left text-blue-800"
                                                >
                                                    {reportName}
                                                </button>

                                                {/* Для Админов и Редакторов */}
                                                <RoleGuard requiredRoles={['ROLE_ADMIN', 'ROLE_EDITOR']}>
                                                    <button
                                                        onClick={() => handleReportEditClick(reportName, option.category)}>
                                                        <i className="fa-solid fa-file-pen hover:text-blue-800"></i>
                                                    </button>
                                                </RoleGuard>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>}


                {isModalError &&
                    <ModalNotifyError title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>
                }


                {isModalParameter &&
                    <ModalParameterWithLayout parameters={parametersMeta || []} layout={paramLayout} onSubmit={onSubmitParameters}
                                              onClose={() => {setIsModalParameter(false)}}/>
                }

                {isModalSettings &&
                    <ReportSetting reportName={selectName} reportCategory={selectCategory} onClose={closeReportSettings} onUpdateReports={fetchReportsName}/>
                }

            </div>
        </div>
    </>)
}


export default observer(ReportsPage);