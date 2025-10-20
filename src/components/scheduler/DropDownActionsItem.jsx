import React from "react";


export function DropDownActionsItem({contextMenu, pin}) {


    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    minWidth: '150px'
                }}
            >
                <div className="p-2 border-b">
                    <strong>{contextMenu.item?.title}</strong>
                </div>

                <div className="px-2 py-1" >
                    <button onClick={()=>{pin()}} className="hover:bg-gray-100 w-full text-start px-2">
                        Закрепить
                    </button>

                </div>

            </div>
        </>
    )
}