import React, {useMemo, useState} from "react";


export function DataTable({data, setData, updatePday, selectDate, dateData}) {

    const [expandedGroups, setExpandedGroups] = useState(new Set());

    // Группируем данные по SNM (названию продукта)
    const groupedData = useMemo(() => {
        const productGroups = {};

        Object.values(data).forEach(item => {
            // Группируем по названию продукта (SNM)
            const productName = item.SNM || 'Без названия';
            if (!productGroups[productName]) {
                productGroups[productName] = {
                    productName: productName,
                    items: []
                };
            }

            productGroups[productName].items.push(item);
        });

        return Object.values(productGroups);
    }, [data]);

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
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const truncateName = (name, maxLength = 50) => {
        if (!name) return '';
        return name;
    };

    const expandedGroupsCount = expandedGroups.size;

    function selectAllInGroup(e, productGroup) {
        const newDate = e.target.checked ? selectDate : "1899-12-30";

        const requestData = {};
        productGroup.items.forEach(item => {
            requestData[item.SNPZ] = newDate;
        });

        updatePday(requestData)
            .then(() => {
                // Обновляем состояние для всех элементов группы
                setData(prevData => {
                    const updatedData = { ...prevData };

                    productGroup.items.forEach(item => {
                        if (updatedData[item.SNPZ]) {
                            updatedData[item.SNPZ] = {
                                ...updatedData[item.SNPZ],
                                DTF: newDate
                            };
                        }
                    });

                    return updatedData;
                });
            })
    }


    async function select(e, item) {
        const newDate = e.target.checked ? selectDate : "1899-12-30";

        const requestData = { [item.SNPZ]: newDate };
        updatePday(requestData)
            .then(() => {
                setData(prevData => ({
                    ...prevData,
                    [item.SNPZ]: {
                        ...prevData[item.SNPZ],
                        DTF: newDate
                    }
                }));
            })
    }


    function checkDateValid(date) {

        if (date === selectDate || date === "1899-12-30" || "") {
            return true;
        }

        return false
    }

    function checkInput(date) {
        if (date === selectDate ) {
            return true;
        }

        return false;
    }

    function checkGroupInput(group) {
        if (!group.items || group.items.length === 0) {
            return false;
        }

        const allItemsValid = group.items.every(item => {
            return checkInput(item.DTF);
        });

        return allItemsValid;
    }


    return (
        <div className="p-4">
            <div className="px-3 py-2 rounded flex flex-row justify-between align-middle text-black mb-2">
                <div style={{fontSize: '16px'}}>


                    <button
                        className=" bg-blue-800 text-white px-3 py-1 w-36"
                        onClick={toggleAllGroups}
                        style={{
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {expandedGroupsCount === groupedData.length ? 'Свернуть все' : 'Развернуть все'}
                    </button>
                </div>
                <div>
                    <span className="text-xl font-medium">
                         Задание {dateData}
                    </span>
                </div>
                <div className="py-1" style={{fontSize: '14px'}}>
                    Групп: {groupedData.length} | Развернуто: {expandedGroupsCount} | Всего
                    записей: {Object.values(data).length}
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
                    const bgGroupName = isExpanded ? "bg-blue-800 border-gray-400 text-white" : "border-gray-400"

                    return (
                        <div key={productGroup.productName}>
                            {/* Заголовок группы - только название продукта */}
                            <div
                                className={bgGroupName + " border"}
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
                                    <input type={"checkbox"} checked={checkGroupInput(productGroup)} onChange={(e) => selectAllInGroup(e, productGroup)}
                                           onClick={(e) => {
                                               e.stopPropagation();
                                           }}/>
                                </div>

                                <span className="text-md">
                                    {truncateName(productGroup.productName)}
                                </span>
                                <span style={{marginLeft: 'auto', fontSize: '12px', opacity: 0.9}}>
                                    Записей: {productGroup.items.length}
                                </span>
                            </div>

                            {/* Детальная таблица при разворачивании */}
                            {isExpanded && (
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                                    <thead>
                                    <tr style={{backgroundColor: '#34495e', color: 'white'}}>
                                        <th className="w-[5%]" style={{padding: '8px', textAlign: 'center'}}>
                                            {/*<input type={"checkbox"}/>*/}
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
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>Условия
                                            хранения
                                        </th>
                                        <th className="w-[10%]" style={{padding: '6px', textAlign: 'center'}}>№
                                            задания
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {productGroup.items.map((item, index) => (
                                        <tr
                                            key={item.SNPZ || index}
                                            className={`
                                            ${checkDateValid(item.DTF)
                                                ? (index % 2 === 0 ? " bg-white " : " bg-gray-50 ")
                                                : " bg-gray-300 "
                                            }`}
                                            style={{
                                                borderBottom: '1px solid #e9ecef'
                                            }}
                                        >
                                            <td className="w-[5%]"
                                                style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                <input disabled={!checkDateValid(item.DTF)} type={"checkbox"} checked={checkInput(item.DTF)}
                                                       onChange={(e) => select(e, item)}/>
                                            </td>
                                            <td className="w-[10%]"
                                                style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                {item.KMC}
                                            </td>
                                            <td className="w-[25%]"
                                                style={{textAlign: 'center', padding: '12px', color: '#666'}}>
                                                {truncateName(item.SNM, 60)}
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
                                    ))}
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