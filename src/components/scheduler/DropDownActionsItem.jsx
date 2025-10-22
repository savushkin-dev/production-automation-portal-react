import React from "react";


export function DropDownActionsItem({contextMenu, pin, unpin}) {


    return (
        <>
            <div
                className="bg-white border rounded-md shadow"
                style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    zIndex: 1000,
                    minWidth: '150px',
                    // maxWidth: '300px'
                }}
            >
                <div className="py-2 px-4 border-b">
                    <strong>{contextMenu.item?.title}</strong>
                </div>

                <div className="px-2 py-1">
                    <button onClick={() => {
                        pin()
                    }} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                        Закрепить
                    </button>
                    <button onClick={() => {
                        unpin()
                    }} className="hover:bg-gray-100 w-full text-start px-2 rounded">
                        Открепить линию
                    </button>
                </div>

            </div>
        </>
    )
}