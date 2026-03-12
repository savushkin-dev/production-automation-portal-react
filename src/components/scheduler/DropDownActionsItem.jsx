import React, {useEffect} from "react";
import {isDelayItem, isFactItem} from "../../utils/scheduler/items";


export function DropDownActionsItem({contextMenu, pin, unpin, openModalMoveJobs, openModalAssignSettings, selectedItems,
                                    updateServiceWork, removeServiceWork, sortRange, updateDelayJob}) {

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

    const styleButton = "hover:bg-gray-100 w-full text-start px-2 rounded hover:text-gray-900";

    return (
        <>
                <div
                    className="bg-white border rounded-md shadow"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 1000,
                        maxWidth: '300px',
                        minWidth: '300px'
                    }}
                >

                    <div className="py-1 px-4 border-b bg-gray-600 text-white rounded-t font-medium">
                        <span>{contextMenu.item?.title}</span>
                    </div>

                    <div className="px-2 py-1">
                        {!contextMenu.forCanvas &&
                            <>
                                {!isDelayItem(contextMenu.item) &&
                                    <>
                                        <button onClick={() => {
                                            pin()
                                        }} className={styleButton}>Закрепить линию по
                                        </button>
                                        <button onClick={() => {
                                            unpin()
                                        }} className={styleButton}>Открепить линию
                                        </button>
                                        <button onClick={() => {
                                            openModalMoveJobs()
                                        }} className={styleButton}>Переместить
                                        </button>
                                        <button onClick={() => {
                                            openModalAssignSettings()
                                        }} className={styleButton}>
                                            Добавить сервисную операцию
                                        </button>
                                    </>
                                }


                                {/*Отображение для сервисной работы*/}
                                {contextMenu.item.info.maintenance === true && selectedItems.length === 1 && !isDelayItem(contextMenu.item) &&
                                    <>
                                        <button onClick={() => {
                                            updateServiceWork()
                                        }} className={styleButton}>
                                            Изменить сервисную операцию
                                        </button>

                                        {/*{contextMenu.item.info.start && isDateWithinLastDays(contextMenu.item.info.start, 2) &&*/}
                                        <button onClick={() => {
                                            removeServiceWork(selectedItems[0].group, selectedItems[0].info.groupIndex - 1)
                                        }} className={styleButton}>
                                            Удалить сервисную операцию
                                        </button>
                                        {/*}*/}
                                    </>
                                }
                                {/*Отображение сортировки*/}
                                {selectedItems.filter(item => !isFactItem(item)).length > 1 && !isDelayItem(contextMenu.item) &&
                                    <>
                                        <button onClick={() => {
                                            sortRange(true)
                                        }} className={styleButton}>Отсортировать по
                                            возрастанию
                                        </button>
                                        <button onClick={() => {
                                            sortRange(false)
                                        }} className={styleButton}>Отсортировать по
                                            убыванию
                                        </button>
                                    </>
                                }
                                {/*Отображение для элемента отклонения*/}
                                {isDelayItem(contextMenu.item) && selectedItems.length === 1 &&
                                    <>
                                        <button onClick={() => {
                                            updateDelayJob()
                                        }} className={styleButton}>
                                            Изменить описание
                                        </button>
                                    </>
                                }

                            </>
                        }
                        {/*Меню вне элементов*/}
                        {contextMenu.forCanvas &&
                            <button onClick={() => {
                                openModalAssignSettings()
                            }} className={styleButton}>
                                Добавить сервисную операцию
                            </button>
                        }
                    </div>

                </div>
        </>
    )
}
