import React from 'react';

export function BlueButton({ onClick, text = 'Кнопка', className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 h-[30px] text-[0.900rem] font-medium rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] ${className}`}
        >
            {text}
        </button>
    );
}