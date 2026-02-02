import React, {useState} from 'react'
import {styleInputWithoutRounded} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";
import {getLastItemIndexInGroup, isFactItem} from "../../utils/scheduler/items";


export function ModalMoveJobs({
                                  onClose,
                                  moveJobs,
                                  selectedItems,
                                  planByHardware,
                                  lines
                              }) {

    function move() {
        //Отсеиваем фактические элементы
        const filteredItems = selectedItems
            .filter(item => !isFactItem(item));

        const groupId = filteredItems[0].group;
        const sortedSelected = filteredItems
            .sort((a, b) => a.start_time - b.start_time);
        const firstItem = sortedSelected[0];
        const firstItemIndex = firstItem.info.groupIndex-1;
        moveJobs(groupId, selectLine.value, firstItemIndex, filteredItems.length, insertIndex - 1);
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
            if (isLastPos) {
                setInsertIndex(getLastItemIndexInGroup(event.value, planByHardware) + 2)
            }
        } else {
            setSelectLine(options[1]);
            if (isLastPos) {
                setInsertIndex(getLastItemIndexInGroup(options[1].value, planByHardware) + 2)
            }
        }
    };

    const handleChangeInsertIndex = (event) => {
        setInsertIndex(event)
    };

    const handleChangeIsLastPos = (event) => {
        setIsLastPos(event)
        if (event === true) {
            setInsertIndex(getLastItemIndexInGroup(selectLine.value, planByHardware) + 2)
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