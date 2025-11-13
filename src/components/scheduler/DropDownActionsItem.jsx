import React from "react";


export function DropDownActionsItem({contextMenu, pin, unpin, openModalMoveJobs, openModalAssignSettings, isDisplayByHardware}) {


    return (
        <>
            {isDisplayByHardware &&
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
                                {/*<button onClick={() => {*/}
                                {/*    openModalAssignSettings()*/}
                                {/*}} className="hover:bg-gray-100 w-full text-start px-2 rounded">*/}
                                {/*    Добавить сервисную операцию*/}
                                {/*</button>*/}
                            </>
                        }
                        {/*{contextMenu.forCanvas &&*/}
                        {/*    <button onClick={() => {*/}
                        {/*        openModalAssignSettings()*/}
                        {/*    }} className="hover:bg-gray-100 w-full text-start px-2 rounded">*/}
                        {/*        Добавить сервисную операцию*/}
                        {/*    </button>*/}
                        {/*}*/}
                    </div>

                </div>}
        </>
    )
}