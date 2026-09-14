import React, {useEffect, useState} from 'react'
import {GrayButton} from "./buttons/GrayButton";
import SchedulerService from "../../services/ScheduleService";
import moment from "moment/moment";

export function ModalDailyProductions({selectDate, onClose, setIsModalNotifyError, setMsg}) {

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDailyProductions()
    }, [selectDate]);

    async function fetchDailyProductions() {
        setLoading(true);
        try {
            const response = await SchedulerService.getDailyProductions(`${selectDate}T08:00:00`)
            setData(response.data)
        } catch (e) {
            console.error(e)
            setMsg("Ошибка получения выработки по линиям: " + (e.response?.data?.message || e.message))
            setIsModalNotifyError(true)
        } finally {
            setLoading(false);
        }
    }

    // Получаем все линии (исключая total)
    const linesData = Object.values(data).filter(item => item.name !== 'Итого');
    const totalData = data.total;

    // Форматирование времени
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return moment(dateString).format('HH:mm');
    };

    // Рассчет длительности в минутах
    const getDuration = (start, end) => {
        if (!start || !end) return '-';
        const duration = moment(end).diff(moment(start), 'minutes');
        if (duration < 60) {
            return `${duration} мин`;
        }
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return `${hours}ч ${minutes}мин`;
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{zIndex: 100}}>
                <div className="w-auto min-w-[75vw] max-w-[100vw] bg-white rounded-lg p-5 pt-3 px-8 pointer-events-auto max-h-[90vh] flex flex-col">
                    {/* Заголовок с мини-макетом партии */}
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl font-medium">
                            Выработка по линиям за {moment(selectDate).format('DD.MM.YYYY')}
                        </h1>

                        <div className="flex flex-row items-center text-center gap-2">
                            <span className="text-sm text-gray-500">Пример отображения партии:</span>
                            {/* Мини-макет партии */}
                            <div className="bg-white w-[300px] border border-gray-300 rounded shadow-lg p-2">

                                <div className="flex items-center text-[10px]">
                                    <span className="w-[18%] text-center font-semibold text-gray-600">Snpz</span>
                                    <span className="w-[18%] text-center font-semibold text-gray-600">№ партии</span>
                                    <span className="w-[18%] text-center font-semibold text-gray-600">Масса</span>
                                    <span className="w-[28%] text-center font-semibold text-gray-600">Время</span>
                                    <span className="w-[18%] text-center font-semibold text-gray-600">Длит.</span>
                                </div>
                                <div className="flex items-center text-[10px] bg-gray-50 rounded px-1 py-0.5 mt-0.5">
                                    <span className="w-[18%] text-center font-mono text-gray-800">243489</span>
                                    <span className="w-[18%] text-center text-gray-500">№140</span>
                                    <span className="w-[18%] text-center text-gray-700">227.00</span>
                                    <span className="w-[28%] text-center text-gray-500">08:05→08:42</span>
                                    <span className="w-[18%] text-center text-gray-400">37 мин</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <hr/>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 font-medium">
                                Загрузка данных...
                                <i className="fa-solid text-blue-800 fa-spinner fa-spin ml-2 text-2xl"></i>
                            </div>
                        ) : linesData.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Нет данных за выбранную дату</div>
                        ) : (
                            <>
                                {/* Таблица с данными по линиям */}
                                <div className="my-3">
                                    {/* Заголовок таблицы */}
                                    <div className="flex flex-row w-full bg-blue-800 text-white rounded-t justify-between sticky top-0 z-10">
                                        <span className="w-[12%] py-1 px-2 font-medium text-center">Наименование</span>
                                        <span className="w-[7%] py-1 px-2 font-medium text-center">Всего (кг)</span>
                                        <span className="w-[7%] py-1 px-2 font-medium text-center">1 смена</span>
                                        <span className="w-[7%] py-1 px-2 font-medium text-center">2 смена</span>
                                        <span className="w-[67%] py-1 px-2 font-medium text-center">Партии</span>
                                    </div>

                                    {/* Данные по линиям */}
                                    {linesData.map((item, index) => (
                                        <div key={index} className="flex flex-col border-b border-gray-200">
                                            <div className="flex flex-row py-2">
                                                <div className="w-[12%] px-2 text-center font-medium flex items-center justify-center">
                                                    {item.name || '-'}
                                                </div>
                                                <div className="w-[7%] px-2 text-center font-medium text-gray-800 flex items-center justify-center">
                                                    {item.massa ? item.massa.toFixed(2) : '0.00'}
                                                </div>
                                                <div className="w-[7%] px-2 text-center font-medium text-gray-700 flex items-center justify-center">
                                                    {item.massa1 ? item.massa1.toFixed(2) : '0.00'}
                                                </div>
                                                <div className="w-[7%] px-2 text-center font-medium text-gray-700 flex items-center justify-center">
                                                    {item.massa2 ? item.massa2.toFixed(2) : '0.00'}
                                                </div>
                                                <div className="w-[67%] px-2">
                                                    {/* Блок с партиями - горизонтальное расположение */}
                                                    <div className="flex gap-2">
                                                        {/* Партии 1 смены */}
                                                        <div className="flex-1 border border-gray-200 rounded bg-gray-50">
                                                            <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded-t border-b border-gray-200">
                                                                <span className="text-xs font-semibold text-gray-700">1 смена</span>
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    ({item.shift1?.length || 0} шт, {item.massa1 ? item.massa1.toFixed(2) : '0.00'} кг)
                                                                </span>
                                                            </div>
                                                            <div className="max-h-[120px] overflow-y-auto p-1">
                                                                {item.shift1 && item.shift1.length > 0 ? (
                                                                    item.shift1.map((batch, idx) => (
                                                                        <div key={idx}
                                                                             className="flex items-center justify-between text-xs py-0.5 px-1 hover:bg-gray-100 rounded border-b border-gray-100 last:border-0">
                                                                            <span
                                                                                className="font-mono text-gray-800 w-[18%] text-center">{batch.snpz}</span>
                                                                            <span
                                                                                className="text-gray-500 w-[18%] text-center">
                                                                                №{batch.np || batch.npp || '-'}
                                                                            </span>
                                                                            <span
                                                                                className="font-medium text-gray-700 w-[18%] text-center">
                                                                                {batch.massa.toFixed(2)} кг
                                                                            </span>
                                                                            <span
                                                                                className="text-gray-500 w-[28%] text-center">
                                                                                {formatTime(batch.dts)}→{formatTime(batch.dte)}
                                                                            </span>
                                                                            <span
                                                                                className="text-gray-400 w-[18%] text-center">
                                                                                ({getDuration(batch.dts, batch.dte)})
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div
                                                                        className="text-gray-400 text-xs text-center py-2">
                                                                        Нет партий
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Партии 2 смены */}
                                                        <div className="flex-1 border border-gray-200 rounded bg-gray-50">
                                                            <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded-t border-b border-gray-200">
                                                                <span className="text-xs font-semibold text-gray-700">2 смена</span>
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    ({item.shift2?.length || 0} шт, {item.massa2 ? item.massa2.toFixed(2) : '0.00'} кг)
                                                                </span>
                                                            </div>
                                                            <div className="max-h-[120px] overflow-y-auto p-1">
                                                                {item.shift2 && item.shift2.length > 0 ? (
                                                                    item.shift2.map((batch, idx) => (
                                                                        <div key={idx}
                                                                             className="flex items-center justify-between text-xs py-0.5 px-1 hover:bg-gray-100 rounded border-b border-gray-100 last:border-0">
                                                                            <span
                                                                                className="font-mono text-gray-800 w-[18%] text-center">{batch.snpz}</span>
                                                                            <span
                                                                                className="text-gray-500 w-[18%] text-center">
                                                                                №{batch.np || batch.npp || '-'}
                                                                            </span>
                                                                            <span
                                                                                className="font-medium text-gray-700 w-[18%] text-center">
                                                                                {batch.massa.toFixed(2)} кг
                                                                            </span>
                                                                            <span
                                                                                className="text-gray-500 w-[28%] text-center">
                                                                                {formatTime(batch.dts)}→{formatTime(batch.dte)}
                                                                            </span>
                                                                            <span
                                                                                className="text-gray-400 w-[18%] text-center">
                                                                                ({getDuration(batch.dts, batch.dte)})
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div
                                                                        className="text-gray-400 text-xs text-center py-2">
                                                                        Нет партий
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Итоговая строка */}
                                {totalData && (
                                    <div className="border-gray-300">
                                        <div className="flex flex-row w-full bg-gray-100 rounded font-medium">
                                            <span className="w-[12%] py-1 px-2 text-center">Итого:</span>
                                            <span className="w-[7%] py-1 px-2 text-center">
                                                {totalData.massa ? totalData.massa.toFixed(2) : '0.00'}
                                            </span>
                                            <span className="w-[7%] py-1 px-2 text-center">
                                                {totalData.massa1 ? totalData.massa1.toFixed(2) : '0.00'}
                                            </span>
                                            <span className="w-[7%] py-1 px-2 text-center">
                                                {totalData.massa2 ? totalData.massa2.toFixed(2) : '0.00'}
                                            </span>
                                            <span className="w-[67%] py-1 px-2 text-center">
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex flex-row justify-end border-t pt-3 mt-3">
                        <div className="flex flex-row justify-end items-center bg-white">
                            <GrayButton text={"Закрыть"} onClick={onClose}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}