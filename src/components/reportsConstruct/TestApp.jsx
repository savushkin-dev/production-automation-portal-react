// TestApp.jsx
import React, { useState } from 'react';

import { TestGridResult } from './TestGridResult';
import {TestGrid} from "./TestGrid";

export function TestApp() {
    const [mode, setMode] = useState('user'); // 'designer' или 'user'

    return (
        <div className="p-4">
            <div className="mb-6 flex gap-4 border-b pb-4">
                <button
                    onClick={() => setMode('designer')}
                    className={`px-4 py-2 rounded ${
                        mode === 'designer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    👷 Режим конструктора
                </button>
                <button
                    onClick={() => setMode('user')}
                    className={`px-4 py-2 rounded ${
                        mode === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    👤 Режим пользователя
                </button>
            </div>



            {mode === 'designer' ? <TestGrid /> : <TestGridResult />}
            {/*<TestGridResult />*/}
        </div>
    );
}