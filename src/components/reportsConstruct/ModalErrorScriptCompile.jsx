import React from 'react'

export function ModalErrorScriptCompile({title, message, onClose}) {

    // Функция для парсинга сообщения об ошибке
    const parseErrorMessage = (msg) => {
        if (!msg || !msg.includes('Compilation failed:')) {
            return { errors: [], rawMessage: msg };
        }

        const lines = msg.split('\n');
        const errors = [];
        let currentError = null;
        let collectingCode = false;
        let currentCodeBlock = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const errorMatch = line.match(/Error #(\d+) at line (\d+), column (\d+):/);
            if (errorMatch) {
                if (currentError) {
                    currentError.codeBlock = [...currentCodeBlock];
                    errors.push(currentError);
                }

                currentError = {
                    number: errorMatch[1],
                    line: parseInt(errorMatch[2]),
                    column: parseInt(errorMatch[3]),
                    message: '',
                    codeBlock: []
                };
                currentCodeBlock = [];
                collectingCode = false;
                continue;
            }

            if (currentError && line.trim().startsWith('Message:')) {
                currentError.message = line.replace('Message:', '').trim();
                collectingCode = true;
                continue;
            }

            if (currentError && collectingCode) {
                currentCodeBlock.push(line);
            }
        }

        if (currentError) {
            currentError.codeBlock = [...currentCodeBlock];
            errors.push(currentError);
        }

        return { errors, rawMessage: msg };
    };

    const { errors, rawMessage } = parseErrorMessage(message);

    // Функция для добавления отступа к строкам с птичками
    const formatCodeWithOffset = (codeBlock) => {
        return codeBlock.map((line, index) => {
            // Если это строка с птичкой (содержит ^)
            if (line.includes('^')) {
                // Добавляем отступ в 2 пробела
                return <div key={index} style={{ paddingLeft: '2ch' }}>{line}</div>;
            }
            // Обычные строки без изменений
            return <div key={index}>{line}</div>;
        });
    };

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                style={{zIndex: 99}}
                onClick={onClose}
            />
            <div
                className="w-full max-w-[900px] lg:w-[900px] p-5 z-30 rounded bg-white absolute left-1/2 px-8 max-h-[80vh] overflow-y-auto"
                style={{zIndex: 100, top: '50%', transform: 'translate(-50%, -50%)'}}
            >
                <div className="flex flex-row justify-start mb-4 sticky top-0 bg-white py-2 border-b">
                    <h1 className="text-xl font-medium text-start">{title}</h1>
                    <span className="text-red-600 pr-2 h-[20px] mt-1 ml-2 w-[20px]">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </span>
                </div>

                <div className="flex flex-col space-y-6">
                    {errors.length > 0 ? (
                        errors.map((error, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-3">
                                <div className="text-sm font-medium text-red-600 mb-1">
                                    Ошибка #{error.number} в строке {error.line}, колонка {error.column}
                                </div>
                                <div className="text-sm text-gray-700 mb-3 bg-red-50 p-2 rounded">
                                    {error.message}
                                </div>

                                {/* Отображаем код с отступом для птичек */}
                                <div className="bg-gray-100 rounded border border-gray-200 overflow-x-auto">
                                    <div className="p-3 font-mono text-sm whitespace-pre"
                                         style={{minWidth: 'max-content'}}>
                                        {formatCodeWithOffset(error.codeBlock)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <pre
                            className="text-red-600 font-mono text-sm whitespace-pre overflow-x-auto bg-gray-50 p-3 rounded border">
                            {rawMessage}
                        </pre>
                    )}

                    <div className="sticky bottom-0 bg-white py-3 flex justify-end border-t">
                        <button
                            onClick={onClose}
                            className="px-6 h-8 rounded text-sm font-medium shadow-sm border bg-blue-800 hover:bg-blue-700 text-white"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}