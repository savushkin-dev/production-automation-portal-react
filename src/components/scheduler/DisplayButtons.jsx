import React from "react";


export function DisplayButtons({activeDisplay, setActiveDisplay}) {

    const handleChangePlanFact = (e) => {
        setActiveDisplay(prevState => ({...prevState,
            planFact: true,
            plan: false,
            fact: false
        }))
    }

    const handleChangePlan = (e) => {
        setActiveDisplay(prevState => ({...prevState,
            planFact: false,
            plan: true,
            fact: false
        }))
    }

    const handleChangeFact = (e) => {
        setActiveDisplay(prevState => ({...prevState,
            planFact: false,
            plan: false,
            fact: true
        }))
    }

    return (
        <>
            <div
                className="flex flex-row items-center border rounded-md font-medium justify-between px-2 text-md text-gray-700 w-64 h-[32px]">
                <div className="flex flex-col text-center w-1/3">
                    <input
                        className="mt-[2px] bg-red-500 text-red-500 target:text-red-500 hover:text-red-600 hover:bg-red-600"
                        type="radio"
                        checked={activeDisplay.planFact}
                        onChange={handleChangePlanFact}
                    />
                    <span className="text-xs mt-[-2px]">План и факт</span>
                </div>
                <span className="text-lg">|</span>
                <div className="flex flex-col text-center w-1/3">
                    <input
                        className="mt-[2px]"
                        type="radio"
                        checked={activeDisplay.plan}
                        onChange={handleChangePlan}
                    />
                    <span className="text-xs mt-[-2px]">План</span>
                </div>
                <span className="text-lg">|</span>
                <div className="flex flex-col text-center w-1/3">
                    <input
                        className="mt-[2px]"
                        type="radio"
                        checked={activeDisplay.fact}
                        onChange={handleChangeFact}
                    />
                    <span className="text-xs mt-[-2px]">Факт</span>
                </div>
            </div>
            <br/>
        </>
    )
}