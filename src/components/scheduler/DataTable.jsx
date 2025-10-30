import React, {useMemo, useState} from "react";


export function DataTable({data, selectDate, setSelectDateTable}) {

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

        // Преобразуем в массив
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
        return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
    };

    // Подсчет развернутых групп
    const expandedGroupsCount = expandedGroups.size;

    return (
        <div className="p-4">
            {/* Общий заголовок таблицы */}
            <div className="px-3 py-2 rounded flex flex-row justify-between align-middle text-black mb-2">
                <div style={{fontSize: '16px'}}>
                    <button
                        className="mr-4 bg-blue-800 text-white px-3 py-1 w-36"
                        onClick={toggleAllGroups}
                        style={{
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {expandedGroupsCount === groupedData.length ? 'Свернуть все' : 'Развернуть все'}
                    </button>

                    <span>📅 Дата:</span>
                    <input
                        className={"px-2 ml-4"}
                        type="date"
                        value={selectDate}
                        onChange={(e) => setSelectDateTable(e.target.value)}
                    />
                </div>
                <div>
                    <span className="text-xl font-medium">
                         Справочник
                    </span>
                </div>
                <div className="py-1" style={{fontSize: '14px'}}>
                    Групп: {groupedData.length} | Развернуто: {expandedGroupsCount} | Всего записей: {Object.values(data).length}
                </div>
            </div>

            {/* Общая таблица */}
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
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
                                    padding: '12px 16px',
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
                                    <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>КМЦ</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Наименование</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Дата начала</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Дата окончания</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>НП</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Масса</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Кол-во</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>УХ</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>SNPZ</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {productGroup.items.map((item, index) => (
                                        <tr
                                            key={item.SNPZ || index}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                                                borderBottom: '1px solid #e9ecef'
                                            }}
                                        >
                                            <td style={{padding: '12px', color: '#666'}}>
                                                {item.KMC}
                                            </td>
                                            <td style={{padding: '12px', color: '#666'}}>
                                                {truncateName(item.SNM, 60)}
                                            </td>
                                            <td style={{padding: '12px', color: '#666'}}>
                                                {formatDate(item.DTI)}
                                            </td>
                                            <td style={{padding: '12px', color: '#666'}}>
                                                {formatDate(item.DTF)}
                                            </td>
                                            <td style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                {item.NP}
                                            </td>
                                            <td style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                {item.MASSA ? item.MASSA.toLocaleString('ru-RU') : '-'}
                                            </td>
                                            <td style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                {item.KOLEV ? item.KOLEV.toLocaleString('ru-RU') : '-'}
                                            </td>
                                            <td style={{padding: '12px', textAlign: 'center', color: '#666'}}>
                                                {item.UX || 0}
                                            </td>
                                            <td style={{padding: '12px', textAlign: 'center', color: '#666'}}>
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