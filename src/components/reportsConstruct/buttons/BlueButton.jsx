import React from 'react';

export function BlueButton({
                               onClick,
                               text = 'Кнопка',
                               className = '',
                               heightPx = '30',
                               icon = null,
                               iconPosition = 'right', // 'left' или 'right'
                               disabled = false,
                               title = ''
                           }) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            title={title}
            className={`min-w-14 px-3 text-[0.900rem] font-medium rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]
                ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-blue-800 hover:shadow-sm active:scale-100' : ''}
                ${className}`}
            style={{ height: `${heightPx}px` }}
        >
            {icon && iconPosition === 'left' && (
                <i className={`${icon} ${text ? 'pr-2' : ''}`}></i>
            )}
            {text}
            {icon && iconPosition === 'right' && (
                <i className={`${icon} ${text ? 'pl-2' : ''}`}></i>
            )}
        </button>
    );
}