import React from 'react';

export function WhiteButton({
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
            className={`min-w-14 px-3 text-[0.900rem] font-medium transition-all duration-200 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 text-gray-700
                ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-700 hover:border-gray-200' : ''}
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