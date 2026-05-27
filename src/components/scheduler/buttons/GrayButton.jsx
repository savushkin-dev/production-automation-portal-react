import React from 'react';

export function GrayButton({ onClick, text = 'Кнопка', className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 h-[30px] text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-600 ${className}`}
        >
            {text}
        </button>
    );
}