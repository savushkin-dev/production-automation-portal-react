import React from "react";


export function DropDownActionsItem({contextMenu, pin, unpin, openModalMoveJobs, openModalAssignSettings, selectedItems,
                                    updateServiceWork, removeServiceWork}) {

    const isDateWithinLastDays = (isoDateString, days) => {
        if (!isoDateString) return false;
        try {
            const date = new Date(isoDateString);
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - days);
            return date >= daysAgo;
        } catch (e) {
            console.error('Ошибка парсинга даты:', isoDateString, e);
            return false;
        }
    };

    return (
        <>
                <div
                    className="bg-white border rounded-md shadow"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 1000,
                        maxWidth: '300px'
                    }}
                >

                    <div className="py-2 px-4 border-b">
                        <strong>{contextMenu.item?.title}</strong>
                    </div>

                    <div className="px-2 py-1">
                        {!contextMenu.forCanvas &&
                            <>
                                <button onClick={() => {
                                    pin()
                                }} className="hover:bg-gray-100 w-full text-start px-2 rounded">Закрепить линию по
                                </button>
                                <button onClick={() => {
                                    unpin()
                                }} className="hover:bg-gray-100 w-full text-start px-2 rounded">Открепить линию
                                </button>
                                <button onClick={() => {
                                    openModalMoveJobs()
                                }} className="hover:bg-gray-100 w-full text-start px-2 rounded">Переместить
                                </button>
                                <button onClick={() => {
                                    openModalAssignSettings()
                                }} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                                    Добавить сервисную операцию
                                </button>

                                {/*Отображение для сервисной работы*/}
                                {contextMenu.item.info.maintenance === true && selectedItems.length === 1 &&
                                    <>
                                        <button onClick={() => {updateServiceWork()}} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                                            Изменить сервисную операцию
                                        </button>

                                        {contextMenu.item.info.start && isDateWithinLastDays(contextMenu.item.info.start, 2) &&
                                            <button onClick={() => {removeServiceWork(selectedItems[0].group, selectedItems[0].info.groupIndex-1)}} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                                                Удалить сервисную операцию
                                            </button>
                                        }
                                      </>
                                }

                            </>
                        }
                        {/*Меню вне элементов*/}
                        {contextMenu.forCanvas &&
                            <button onClick={() => {
                                openModalAssignSettings()
                            }} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                            Добавить сервисную операцию
                            </button>
                        }
                    </div>

                </div>
        </>
    )
}
