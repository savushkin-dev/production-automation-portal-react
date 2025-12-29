import React, {useMemo, useState, useEffect} from "react";

export function DataTable({data, dateData, selectJobs, setSelectJobs}) {
    const [expandedGroups, setExpandedGroups] = useState(new Set());


    const itemsArray = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.map(item => ({
            SNPZ: item.snpz,
            KMC: item.kmc,
            SNM: item.shortName,
            DTI: item.dti,
            NP: item.np,
            MASSA: item.mass,
            KOLEV: item.quantity,
            UX: item.priority || 0,
            PDTN: item.startProductionDateTime || null,
            isSelected: selectJobs[item.snpz] || false
        }));
    }, [data, selectJobs]);

    const groupedData = useMemo(() => {
        const productGroups = {};

        itemsArray.forEach(item => {
            const productName = item.SNM || 'Без названия';
            if (!productGroups[productName]) {
                productGroups[productName] = {
                    productName: productName,
                    items: []
                };
            }
            productGroups[productName].items.push(item);
        });

        return Object.values(productGroups).map(group => ({
            ...group,
            items: group.items.sort((a, b) => a.NP - b.NP)
        }));
    }, [itemsArray]);

    // Считаем выбранные элементы только в этом компоненте
    const selectedInThisComponent = useMemo(() => {
        return itemsArray.filter(item => item.isSelected).length;
    }, [itemsArray]);

    const toggleGroup = (productName) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(productName)) {
            newExpanded.delete(productName);
        } else {
            newExpanded.add(productName);
        }
        setExpandedGroups(newExpanded);
    };

    const toggleAllGroups = () => {
        if (expandedGroups.size === groupedData.length) {
            setExpandedGroups(new Set());
        } else {
            setExpandedGroups(new Set(groupedData.map(group => group.productName)));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === "" || dateString === null) return "";
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch (e) {
            return dateString;
        }
    };

    const expandedGroupsCount = expandedGroups.size;

    function updateSelectedItems(items, shouldSelect) {
        const availableItems = shouldSelect
            ? items.filter(item => !item.PDTN || item.PDTN === "" || item.PDTN === null)
            : items.filter(item => item.isSelected);

        if (availableItems.length === 0) return;

        setSelectJobs(prevSelectJobs => {
            const updatedSelectJobs = { ...prevSelectJobs };
            availableItems.forEach(item => {
                if (item.SNPZ) {
                    updatedSelectJobs[item.SNPZ] = shouldSelect;
                }
            });
            return updatedSelectJobs;
        });
    }

    function selectAll() {
        const allItems = groupedData.flatMap(group => group.items);
        const availableItems = allItems.filter(item => !item.PDTN || item.PDTN === "" || item.PDTN === null);

        if (availableItems.length === 0) return;

        const allSelected = availableItems.every(item => item.isSelected);
        const shouldSelect = !allSelected;

        updateSelectedItems(allItems, shouldSelect);
    }

    function selectAllInGroup(e, productGroup) {
        updateSelectedItems(productGroup.items, e.target.checked);
    }

    function select(e, item) {
        updateSelectedItems([item], e.target.checked);
    }

    function isItemAvailable(pdtn) {
        return !pdtn || pdtn === "" || pdtn === null;
    }

    function checkGroupInput(group) {
        if (!group.items || group.items.length === 0) return false;

        const availableItems = group.items;
        if (availableItems.length === 0) return false;

        return availableItems.every(item => item.isSelected);
    }

    function hasAvailableItems(group) {
        return group.items.some(item => isItemAvailable(item.PDTN) );
    }

    const totalRecords = itemsArray.length;
    const availableItemsCount = groupedData.flatMap(group =>
        group.items.filter(item => isItemAvailable(item.PDTN))
    ).length;

    const selectedAvailableItemsCount = groupedData.flatMap(group =>
        group.items.filter(item => isItemAvailable(item.PDTN) && item.isSelected)
    ).length;

    const allAvailableSelected = availableItemsCount > 0 && selectedAvailableItemsCount === availableItemsCount;

    return (
        <div className="p-4">
            <div className="px-3 py-2 rounded flex flex-row justify-between align-middle text-black mb-2">
                <div style={{fontSize: '16px'}}>
                    <button
                        className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 w-36 rounded font-medium text-[0.950rem]"
                        onClick={toggleAllGroups}
                    >
                        {expandedGroupsCount === groupedData.length ? 'Свернуть все' : 'Развернуть все'}
                    </button>

                    <button
                        className="ml-4 bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 w-36 rounded font-medium text-[0.950rem]"
                        onClick={selectAll}
                        disabled={availableItemsCount === 0 && !allAvailableSelected}
                    >
                        {availableItemsCount === 0 && !allAvailableSelected
                            ? 'Нет доступных'
                            : allAvailableSelected
                                ? 'Снять все'
                                : 'Отметить все'
                        }
                    </button>
                </div>
                <div>
                    <span className="text-xl font-medium">
                         Задание {dateData}
                    </span>
                </div>
                <div className="py-1" style={{fontSize: '14px'}}>
                    Групп: {groupedData.length} | Развернуто: {expandedGroupsCount} | Всего
                    записей: {totalRecords} | Выбрано в таблице: {selectedInThisComponent}
                </div>
            </div>

            {/* Общая таблица */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                {groupedData.map(productGroup => {
                    const isExpanded = expandedGroups.has(productGroup.productName);

                    let bgGroupName = "";
                    if (!hasAvailableItems(productGroup)) {
                        bgGroupName = "bg-gray-300";
                    } else if (isExpanded) {
                        bgGroupName = "bg-blue-800 text-white";
                    }

                    return (
                        <div key={productGroup.productName}>
                            {/* Заголовок группы */}
                            <div
                                className={bgGroupName + " border border-gray-400"}
                                style={{
                                    padding: '0px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                                onClick={() => toggleGroup(productGroup.productName)}
                            >
                                <span style={{fontWeight: 'bold', fontSize: '16px'}}>
                                    {isExpanded ? <i className="fa-regular fa-square-caret-up"></i> :
                                        <i className="fa-regular fa-square-caret-down"></i>
                                    }
                                </span>

                                <div className="w-[5%]" style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                    <input
                                        type={"checkbox"}
                                        checked={checkGroupInput(productGroup)}
                                        disabled={!hasAvailableItems(productGroup)}
                                        onChange={(e) => selectAllInGroup(e, productGroup)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    />
                                </div>

                                <span className="text-md w-1/3">
                                    {productGroup.productName}
                                </span>

                                <div className="ml-auto inline-flex" style={{fontSize: '12px', opacity: 0.9}}>
                                    <div className="w-28">Масса: {productGroup.items.reduce((sum, item) => sum + (parseFloat(item.MASSA) || 0), 0).toFixed(0)} кг</div>
                                    <div className="w-20">Записей: {productGroup.items.length}</div>
                                    <div className="w-20">Отмечено: {productGroup.items.filter(item => item.isSelected).length}</div>
                                    <div className="w-16">Занято: {productGroup.items.filter(item => !isItemAvailable(item.PDTN) && !item.isSelected).length}</div>
                                    <div className="w-20">Свободно: {productGroup.items.filter(item => isItemAvailable(item.PDTN) && !item.isSelected).length}</div>
                                </div>
                            </div>

                            {/* Детальная таблица при разворачивании */}
                            {isExpanded && (
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                                    <thead>
                                    <tr style={{backgroundColor: '#34495e', color: 'white'}}>
                                        <th className="w-[5%]" style={{padding: '8px', textAlign: 'center'}}>
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Товар</th>
                                        <th className="w-[25%]"
                                            style={{padding: '6px', textAlign: 'center'}}>Наименование
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Дата</th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>№ партии
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Масса</th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Единиц
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Приоритет
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>№
                                            задания
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {productGroup.items.map((item, index) => {
                                        const isAvailable = isItemAvailable(item.PDTN);
                                        const isSelected = item.isSelected;
                                        const isCheckboxEnabled = isAvailable;

                                        return (
                                            <tr
                                                key={item.SNPZ || index}
                                                className={`
                                                    ${(isAvailable )
                                                    ? (index % 2 === 0 ? " bg-white " : " bg-gray-50 ")
                                                    : " bg-gray-300 "
                                                }
                                                    ${!isAvailable && !isSelected ? "text-gray-500" : ""}
                                                `}
                                                style={{
                                                    borderBottom: '1px solid #e9ecef'
                                                }}
                                            >
                                                <td className="w-[5%]"
                                                    style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                    <input
                                                        disabled={!isCheckboxEnabled}
                                                        type={"checkbox"}
                                                        checked={isSelected}
                                                        onChange={(e) => select(e, item)}
                                                    />
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                    {item.KMC}
                                                </td>
                                                <td className="w-[25%]"
                                                    style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                    {item.SNM}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                    {formatDate(item.DTI)}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                    {item.NP}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                    {item.MASSA ? item.MASSA.toLocaleString('ru-RU') : '-'}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                    {item.KOLEV ? item.KOLEV.toLocaleString('ru-RU') : '-'}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                    {item.UX || 0}
                                                </td>
                                                <td className="w-[10%]"
                                                    style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                    {item.SNPZ}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}