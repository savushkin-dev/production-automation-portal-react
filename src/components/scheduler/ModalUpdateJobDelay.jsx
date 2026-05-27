import React, {useEffect, useState} from 'react'
import {styleInputWithoutRounded} from "../../data/styles";
import {isCleaningDelayItem, isCleaningItem} from "../../utils/scheduler/items";
import {GrayButton} from "./buttons/GrayButton";
import {BlueButton} from "./buttons/BlueButton";


export function ModalUpdateJobDelay({onClose, selectedItems, updateDelayJob, updateDelayCleaning}) {


    let isCleaningDelayNote = isCleaningDelayItem(selectedItems[0]) || isCleaningItem(selectedItems[0]);
    const [descriptionOperation, setDescriptionOperation] = useState(isCleaningDelayNote? (selectedItems[0]?.info?.delayNote?.trim() || "")
        :(selectedItems[0]?.info?.cleaningDelayNote?.trim() || ""));

    function update() {
        const firstItem = selectedItems[0];
        const parentIndex = firstItem.info.groupIndex-1;
        const line = firstItem.group;

        if(isCleaningDelayNote){
            updateDelayCleaning(line, parentIndex, descriptionOperation)
        } else {
            updateDelayJob(line, parentIndex, descriptionOperation)
        }
    }


    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[600px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">Изменение причины отклонения от плана</h1>
                    <hr/>

                    <div className="flex flex-row my-2 font-medium">
                        <span className="py-1 font-medium w-1/2">Описание (опционально):</span>
                        <textarea className={styleInputWithoutRounded + " h-[68px] rounded ml-4 w-1/2"}
                                  value={descriptionOperation}
                                  onChange={(e) => setDescriptionOperation(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-row justify-end ">
                        <div className="flex flex-row justify-end items-center bg-white my-2 gap-2">
                            <GrayButton text={"Отмена"} onClick={onClose}/>
                            <BlueButton text={"Применить"} onClick={() => {
                                update();
                                onClose()
                            }} className={""}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}