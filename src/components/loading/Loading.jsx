import React from 'react';
import './Loading.css';

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-start pt-80  ">
                <div className="circle">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
                <p className="text-lg font-medium  mt-4">Загрузка...</p>
        </div>
    );
};

export default Loading;