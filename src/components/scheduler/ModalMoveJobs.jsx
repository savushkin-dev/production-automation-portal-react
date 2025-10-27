import React, {useEffect, useState} from 'react'
import {styleInput, styleInputWithoutRounded, styleLabelInput} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";


export function ModalMoveJobs({onClose, moveJobs, selectedItems, isDisplayByHardware, planByHardware, planByParty, lines}) {

    const getLastItemIndexInGroup = (groupId) => {
        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;

        // Фильтруем элементы по группе и сортируем по времени
        const groupItems = itemsArray
            .filter(item => item.group === groupId)
            .sort((a, b) => a.start_time - b.start_time);

        if (groupItems.length === 0) {
            return -1;
        }

        return groupItems.length - 1;
    };

    function move() {
        // console.log('Выделенные элементы:', selectedItems);

        const itemsArray = isDisplayByHardware ? planByHardware : planByParty;

        if (selectedItems.length === 0) {
            console.log('Нет выделенных элементов');
            return null;
        }

        // Получаем массив выделенных объектов
        const selectedItemsArray = itemsArray.filter(item => selectedItems.includes(item.id));

        const groupId = selectedItemsArray[0].group;

        const allSameGroup = selectedItemsArray.every(item => item.group === groupId);
        if (!allSameGroup) {
            console.warn('Элементы в разных группах! Это не должно происходить');
            return null;
        }

        // Получаем все элементы группы и сортируем
        const groupItems = itemsArray
            .filter(item => item.group === groupId)
            .sort((a, b) => a.start_time - b.start_time);

        const sortedSelected = selectedItemsArray
            .sort((a, b) => a.start_time - b.start_time);

        const firstItem = sortedSelected[0];
        const firstItemIndex = groupItems.findIndex(item => item.id === firstItem.id);
        moveJobs(groupId, selectLine.value, firstItemIndex, selectedItemsArray.length, insertIndex-1)
    }


    const options = lines.map(line => ({
        value: line.lineId,
        label: line.originalName
    }));

    const [selectLine, setSelectLine] = useState(options[0]);
    const [insertIndex, setInsertIndex] = useState(1);
    const [isLastPos, setIsLastPos] = useState(false);


    const handleChangeSelect = (event) => {
        if (event != null) {
            setSelectLine(event);
            if(isLastPos){
                setInsertIndex(getLastItemIndexInGroup(event.value)+2)
            }
        } else {
            setSelectLine(options[1]);
            if(isLastPos){
                setInsertIndex(getLastItemIndexInGroup(options[1].value)+2)
            }
        }
    };

    const handleChangeInsertIndex = (event) => {
        setInsertIndex(event)
    };

    const handleChangeIsLastPos = (event) => {
        setIsLastPos(event)
        if(event === true){
            setInsertIndex(getLastItemIndexInGroup(selectLine.value)+2)
        }
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[600px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Перемещение элементов</h1>
                    <hr/>

                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/2">Выберите новую линию:</span>
                        <Select className=" ml-4 py-1 font-medium text-md w-1/2"
                                value={selectLine}
                                onChange={handleChangeSelect}
                                styles={CustomStyle}
                                options={options}
                                isClearable={false} isSearchable={false}/>
                    </div>
                    <div className="flex flex-row my-2">
                        <span className="py-1 font-medium w-1/2">На какую позицию переместить:</span>
                        <div className="w-1/2 flex flex-row">
                            {/*<input className={styleInput + "px-2 ml-2 py-1 font-medium text-lg w-2/3"}*/}
                            {/*       value={insertIndex}*/}
                            {/*       onChange={(e) => setInsertIndex(e.target.value)}*/}
                            {/*/>*/}
                            <div style={{display: 'flex', alignItems: 'center'}}
                                 className="font-medium w-[100%] ml-2">
                                <input className={styleInputWithoutRounded + " w-[100%]"}
                                       type="number"
                                       min={0}
                                       value={insertIndex}
                                       onChange={(e) => handleChangeInsertIndex(e.target.value)}
                                       style={{
                                           paddingRight: '50%',
                                       }}
                                />
                                <span className="text-sm" style={{
                                    marginLeft: '-80px',
                                    cursor: 'pointer',
                                }}>
                                        В конец
                                    </span>
                                <input className={styleInputWithoutRounded}
                                       type="checkbox"
                                       checked={isLastPos}
                                       onChange={(e) => handleChangeIsLastPos(e.target.checked || "")}
                                       style={{
                                           marginLeft: '5px',
                                           cursor: 'pointer',
                                       }}
                                />

                            </div>
                        </div>

                    </div>


                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <button onClick={onClose}
                                    className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                Отмена
                            </button>
                            <button onClick={() => {
                                move();
                                onClose()
                            }}
                                    className="min-w-[50px] text-xs h-7 font-medium px-2 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                                Применить
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}