import React from 'react'
import {GrayButton} from "./buttons/GrayButton";


export function ModalAnalyze({onClose, analyzeObj}) {

    function defineType(weightStr){
        if (!weightStr) return 'soft'; // Значение по умолчанию

        const parts = weightStr.split('/');

        // Ищем первую часть с ненулевым весом
        const activePart = parts.find(part => {
            const weight = parseInt(part.replace(/[^-\d]/g, '')) || 0;
            return weight !== 0;
        });

        // Если не нашли, ищем любое упоминание типа
        if (!activePart) {
            for (const part of parts) {
                const type = part.replace(/[\d-]/g, '').toLowerCase();
                if (['hard', 'medium', 'soft'].includes(type)) return type;
            }
            return 'soft';
        }

        // Извлекаем тип из найденной части
        const type = activePart.replace(/[\d-]/g, '').toLowerCase();
        return ['hard', 'medium', 'soft'].includes(type) ? type : 'soft';
    }

    function defineScore(scoreStr){
        const activePart = scoreStr.split('/')
            .find(part => !['0hard', '0medium', '0soft'].includes(part));
        return activePart ? parseInt(activePart.replace(/[^-\d]/g, '')) || 0 : 0;
    }

    function defineWeight(weightStr){
        const activePart = weightStr.split('/')
            .find(part => !['0hard', '0medium', '0soft'].includes(part));
        return activePart ? parseInt(activePart.replace(/[^-\d]/g, '')) || 0 : 0;
    }

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex  items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-auto min-w-[900px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <div className="flex flex-row justify-between pb-2">
                        <span className="text-xl font-medium text-start mb-2">Анализ результатов</span>
                        <span className="text-xl font-medium text-start mb-2">({analyzeObj?.score})</span>
                    </div>

                    <hr/>

                    <div className="flex flex-row py-2 border-b">
                        <div className="w-2/6 px-1 font-medium">
                            Ограничение
                        </div>
                        <div className="w-1/6 px-1 font-medium text-center">
                            Тип
                        </div>
                        <div className="w-1/6 px-1 font-medium text-center">
                            Совпадения
                        </div>
                        <div className="w-1/6 px-1 font-medium text-center">
                            Вес
                        </div>
                        <div className="w-1/6 px-1 font-medium text-center">
                            Счет
                        </div>
                    </div>

                    {analyzeObj?.constraints.map((constr, index) => (
                        <div key={index} className="flex flex-row py-2 border-b">
                            <div className="w-2/6 px-1 text-nowrap">
                                {constr.name}
                            </div>
                            <div className="w-1/6 px-1 text-center">
                                {defineType(constr.weight)}
                            </div>
                            <div className="w-1/6 px-1 text-center">
                                {constr.matches.length}
                            </div>
                            <div className="w-1/6 px-1 text-center">
                                {defineWeight(constr.weight)}
                            </div>
                            <div className="w-1/6 px-1 text-center">
                                {defineScore(constr.score)}
                            </div>
                        </div>
                    ))}


                    <div className="flex flex-row justify-end pt-2">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <GrayButton text={"Закрыть"} onClick={onClose}/>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}