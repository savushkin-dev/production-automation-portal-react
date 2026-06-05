import React from "react";

export function DisplayButtons({ activeDisplay, setActiveDisplay }) {
    const handleChangePlanFact = () => {
        setActiveDisplay({
            planFact: true,
            plan: false,
            fact: false
        });
    };

    const handleChangePlan = () => {
        setActiveDisplay({
            planFact: false,
            plan: true,
            fact: false
        });
    };

    const handleChangeFact = () => {
        setActiveDisplay({
            planFact: false,
            plan: false,
            fact: true
        });
    };

    return (
        <div className="flex items-center gap-1 h-[32px] border border-gray-200  rounded">
            <button
                onClick={handleChangePlanFact}
                className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                    activeDisplay.planFact
                        ? 'text-blue-700 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
            >
                План и факт
            </button>
            <button
                onClick={handleChangePlan}
                className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                    activeDisplay.plan
                        ? 'text-blue-700 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
            >
                План
            </button>
            <button
                onClick={handleChangeFact}
                className={`px-3 py-1 text-[0.800rem] font-medium transition-all duration-200 border-b-2 ${
                    activeDisplay.fact
                        ? 'text-blue-700 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
            >
                Факт
            </button>
        </div>
    );
}