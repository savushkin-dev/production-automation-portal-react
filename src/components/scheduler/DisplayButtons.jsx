import React from "react";


export function DisplayButtons({activeDisplay, setActiveDisplay}) {

    const handleChangePlanFact = () => {
        setActiveDisplay(prevState => ({...prevState,
            planFact: true,
            plan: false,
            fact: false
        }))
    }

    const handleChangePlan = () => {
        setActiveDisplay(prevState => ({...prevState,
            planFact: false,
            plan: true,
            fact: false
        }))
    }

    const handleChangeFact = () => {
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
                <div className="flex flex-col text-center w-1/3 cursor-pointer" onClick={handleChangePlanFact}>
                    <input
                        className="mt-[2px] cursor-pointer"
                        type="radio"
                        checked={activeDisplay.planFact}
                        onChange={handleChangePlanFact}
                    />
                    <span className="text-xs mt-[-2px]">План и факт</span>
                </div>
                <span className="text-lg">|</span>
                <div className="flex flex-col text-center w-1/3 cursor-pointer" onClick={handleChangePlan}>
                    <input
                        className="mt-[2px] cursor-pointer"
                        type="radio"
                        checked={activeDisplay.plan}
                        onChange={handleChangePlan}
                    />
                    <span className="text-xs mt-[-2px]">План</span>
                </div>
                <span className="text-lg">|</span>
                <div className="flex flex-col text-center w-1/3 cursor-pointer" onClick={handleChangeFact}>
                    <input
                        className="mt-[2px] cursor-pointer"
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