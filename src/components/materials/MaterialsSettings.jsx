import React, { useEffect, useState, useCallback, useMemo } from "react";
import MaterialService from "../../services/MaterialService";
import { ModalNotifyError } from "../modal/ModalNotifyError";
import { ModalNotify } from "../modal/ModalNotify";
import Loading from "../loading/Loading";
import { BlueButton } from "../reportsConstruct/buttons/BlueButton";

export function MaterialsSettings({ date, kpp, updateData, recalcTriger }) {
    const [materials, setMaterials] = useState([]);
    const [original, setOriginal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState("");
    const [modalError, setModalError] = useState(false);
    const [modalNotify, setModalNotify] = useState(false);
    const [filter, setFilter] = useState(null);
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async () => {
        if (!date || !kpp) return;

        try {
            setLoading(true);
            const { data } = await MaterialService.getMaterialsSettings(date, kpp);
            const items = data.map(item => ({ ...item, inCalc: item.inCalc ?? true }));
            setMaterials(items);
            setOriginal(JSON.parse(JSON.stringify(items)));
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка загрузки');
            setModalError(true);
        } finally {
            setLoading(false);
        }
    }, [date, kpp]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const hasChanges = useMemo(() => {
        if (materials.length !== original.length) return true;

        return materials.some((m, i) => {
            const o = original[i];
            return (
                m.kmt !== o.kmt ||
                m.inCalc !== o.inCalc ||
                Number(m.pers ?? 0) !== Number(o.pers ?? 0) ||
                Number(m.rnd ?? 0) !== Number(o.rnd ?? 0)
            );
        });
    }, [materials, original]);

    const filtered = useMemo(() => {
        let result = materials;

        if (filter !== null) {
            result = result.filter(m => m.inCalc === filter);
        }

        if (search.trim()) {
            const term = search.toLowerCase().trim();
            result = result.filter(m =>
                m.kmt?.toLowerCase().includes(term) ||
                m.snm?.toLowerCase().includes(term)
            );
        }

        return result;
    }, [materials, filter, search]);

    const toggle = (kmt) => {
        setMaterials(prev => prev.map(m =>
            m.kmt === kmt ? { ...m, inCalc: !m.inCalc } : m
        ));
    };

    const setAll = (value) => {
        setMaterials(prev => prev.map(m => ({ ...m, inCalc: value })));
    };

    const handleNumberChange = (kmt, field, rawValue) => {
        const parsed = rawValue === '' ? 0 : Number(rawValue);
        const finalValue = isNaN(parsed) || parsed < 0 ? 0 : parsed;

        setMaterials(prev => prev.map(m =>
            m.kmt === kmt ? { ...m, [field]: finalValue } : m
        ));
    };

    const handleNumberKeyDown = (e) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    };

    const save = async () => {
        if (!hasChanges) {
            setMsg('Нет изменений');
            setModalNotify(true);
            return;
        }

        try {
            setSaving(true);
            await MaterialService.saveMaterialsSettings(materials);
            setOriginal(JSON.parse(JSON.stringify(materials)));
            setMsg('Выбор материалов сохранен.');
            setModalNotify(true);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка сохранения');
            setModalError(true);
            setMaterials(JSON.parse(JSON.stringify(original)));
        } finally {
            setSaving(false);
            await updateData();
            recalcTriger();
        }
    };

    const cancel = () => {
        setMaterials(JSON.parse(JSON.stringify(original)));
    };

    if (loading) return <Loading />;

    const total = materials.length;
    const inCalc = materials.filter(m => m.inCalc).length;
    const notInCalc = total - inCalc;

    return (
        <div className="w-full h-full p-4 flex flex-col">
            {/* Заголовок */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        Настройка материалов ({total})
                        {hasChanges && <span className="text-sm text-blue-600 ml-3">• Есть изменения</span>}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setAll(true)}
                        disabled={saving}
                        className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Все в расчете
                        <i className="pl-2 fa-solid fa-check"></i>
                    </button>
                    <button
                        onClick={() => setAll(false)}
                        disabled={saving}
                        className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Все не в расчете
                        <i className="pl-2 fa-solid fa-xmark"></i>
                    </button>
                    <button
                        onClick={cancel}
                        disabled={!hasChanges || saving}
                        className="px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Отменить
                        <i className="pl-2 fa-solid fa-rotate-left"></i>
                    </button>
                    <BlueButton
                        onClick={save}
                        text={"Сохранить"}
                        className={"disabled:opacity-50 disabled:cursor-not-allowed"}
                        icon={"fa-solid fa-floppy-disk text-sm pt-0.5"}
                        disabled={!hasChanges || saving}
                    />
                </div>
            </div>

            {/* Фильтры */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-1 h-[32px] border border-gray-200 rounded">
                    <button
                        onClick={() => setFilter(null)}
                        className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                            filter === null
                                ? 'text-blue-700 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                    >
                        Все ({total})
                    </button>
                    <button
                        onClick={() => setFilter(true)}
                        className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                            filter === true
                                ? 'text-blue-700 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                    >
                        В расчете ({inCalc})
                    </button>
                    <button
                        onClick={() => setFilter(false)}
                        className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                            filter === false
                                ? 'text-blue-700 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-800'
                        }`}
                    >
                        Не в расчете ({notInCalc})
                    </button>
                </div>

                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Поиск по коду или названию..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-[30px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                </div>

                <span className="text-sm text-gray-500 whitespace-nowrap">
                    Найдено: {filtered.length}
                </span>
            </div>

            {/* Таблица */}
            <div className="bg-white border rounded overflow-hidden w-fit min-w-[80%]">
                <div className="h-full overflow-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-gray-50">
                        <tr className="text-left text-sm">
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">№</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Код</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Наименование</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200 text-center">Страховой запас</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200 text-center">Округление до</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200 text-center">Ед. изм.</th>
                            <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200 text-center">В расчете</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                                    {materials.length === 0 ? 'Нет данных' : 'Ничего не найдено'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item, idx) => {
                                const origItem = original.find(m => m.kmt === item.kmt);
                                const isPersChanged = origItem && Number(origItem.pers ?? 0) !== Number(item.pers ?? 0);
                                const isRndChanged = origItem && Number(origItem.rnd ?? 0) !== Number(item.rnd ?? 0);
                                const isInCalcChanged = origItem && origItem.inCalc !== item.inCalc;
                                const isChanged = isPersChanged || isRndChanged || isInCalcChanged;

                                return (
                                    <tr
                                        key={item.kmt}
                                        className={`border-b border-gray-200 hover:bg-gray-50`}
                                    >
                                        <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-2 text-sm font-mono text-gray-700">{item.kmt}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{item.snm || item.kmt}</td>
                                        <td className={`px-4 py-1.5 text-center`}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.pers ?? 0}
                                                onChange={(e) => handleNumberChange(item.kmt, 'pers', e.target.value)}
                                                onKeyDown={handleNumberKeyDown}
                                                disabled={saving}
                                                className={`w-24 px-1.5 py-0.5 text-sm text-center font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    isPersChanged
                                                        ? 'text-blue-800'
                                                        : 'border-gray-200 text-gray-700'
                                                } disabled:opacity-50 disabled:bg-gray-50`}
                                            />
                                        </td>
                                        <td className={`px-4 py-1.5 text-center`}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.rnd ?? 0}
                                                onChange={(e) => handleNumberChange(item.kmt, 'rnd', e.target.value)}
                                                onKeyDown={handleNumberKeyDown}
                                                disabled={saving}
                                                className={`w-24 px-1.5 py-0.5 text-sm text-center font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    isRndChanged
                                                        ? 'text-blue-800'
                                                        : 'border-gray-200 text-gray-700'
                                                } disabled:opacity-50 disabled:bg-gray-50`}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500 text-center">{item.edu || '—'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className={`w-6 h-6 ${isChanged ? 'bg-blue-100 rounded' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.inCalc}
                                                    onChange={() => toggle(item.kmt)}
                                                    disabled={saving}
                                                    className="w-4 h-4 mt-1 rounded  focus:ring-blue-500 disabled:opacity-50"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalError && <ModalNotifyError title="Ошибка" message={error} onClose={() => setModalError(false)}/>}
            {modalNotify && <ModalNotify title="Результат" message={msg} onClose={() => setModalNotify(false)}/>}
        </div>
    );
}