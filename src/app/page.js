'use client'
import {createRef, useEffect, useState} from "react";
import {getSchedule, stringToArray} from "cron-converter";
import {DateTime} from "luxon";
import cronstrue from 'cronstrue';
import 'cronstrue/locales/en'
export default function Home() {
    const [value, setValue] = useState('* * * * *');
    const [expErr, setExpErr] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(null);
    const inputRef = createRef();
    const [inputState, setInputState] = useState(false);
    const [rules, setRules] = useState([]);
    const [positionType, setPositionType] = useState('');
    const [result, setResult] = useState([]);
    const [tips, setTips] = useState('');
    const rule = {
        'normal': [
            ['*','any value'],
            [',','value list separator'],
            ['-','range of values'],
            ['/','step values']
        ],
        'minute' : [
            ['0-59','allowed values'],
        ],
        'hour' : [
            ['0-23','allowed values'],
        ],
        'day' : [
            ['1-31','allowed values'],
        ],
        'month' : [
            ['1-12','allowed values'],
        ],
        'week' : [
            ['0-6','allowed values'],
        ],
    }

    const tabs = [
        ['minute', 'minute'],
        ['hour', 'hour'],
        ['day', 'day(month)'],
        ['month', 'month'],
        ['week', 'day(week)'],
    ]

    useEffect(() => {
        showDatetime()
    }, []);

    const checkType = (range,currentStr) =>{

        let curPositionType = ''
        let curPosition = range || cursorPosition
        let curStr = currentStr || value

        const parts = curStr.split(" ");

        if (parts.length === 5) {
            let minuteLength = parts[0].length
            let hourLength = minuteLength + parts[1].length + 1
            let dayLength = hourLength + parts[2].length + 1
            let monthLength = dayLength + parts[3].length + 1
            let weekLength = monthLength + parts[4].length

            if (!expErr && curPosition >= 0) {
                if (curPosition >= 0 && curPosition <= minuteLength) {
                    curPositionType = 'minute'
                } else if (curPosition > minuteLength && curPosition <= hourLength) {
                    curPositionType = 'hour'
                } else if (curPosition > hourLength && curPosition <= dayLength) {
                    curPositionType = 'day'
                } else if (curPosition > dayLength && curPosition <= monthLength) {
                    curPositionType = 'month'
                } else if (curPosition >= weekLength) {
                    curPositionType = 'week'
                }
            }
        }

        setPositionType(curPositionType)

        return curPositionType
    }
    const handleRules = (range)=> {
        let positionType = checkType(range)

        if (positionType) {
            setRules(rule[positionType]);
        } else {
            setRules([])
        }
    }
    const handlePosition = (currentStr) => {
        try {
            let range = null
            if (inputRef.current != null) {
                range = inputRef.current.selectionStart || 0;
                if (range != null) {
                    setCursorPosition(range);
                } else {
                    setCursorPosition(null);
                }
            }
            setInputState(true)
            handleRules(range,currentStr)
        } catch (err) {
            console.log('keydown fail: ',err.message)
        }
    }
    const handleInputBlur = (e) => {
        setInputState(false)
    };
    const handleClick = () => {
        showDatetime()
        handlePosition()
    }
    const handleKeyUp = (e) => {
        setTimeout(()=>{
            handlePosition()
        },1)
    }
    const handleChange = (e) => {
        handlePosition()
        let current = e.target.value.replace(/\s+/g, " ")
        setValue(current)
        showDatetime(current)
    }
    const showDatetime = (current) => {
        try {
            let dateArr = stringToArray(current || value)
            let schedule = null
            let next = null
            let timePointer = new Date();
            let result = []
            for (let i = 0; i < 5; i++) {
                schedule = getSchedule(dateArr, new Date(timePointer));
                next = schedule.next()
                result.push(next.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS))
                timePointer = next + 1000
            }
            setResult(result)
            setExpErr(false)
            setTips('" ' + cronstrue.toString(current || value, { locale: "en" }) + '. "')
        } catch (err) {
            console.log('cron fail: ', err.message)
            setExpErr(true)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between 2xl:p-8 p-4">
            <div className="mt-8 mb-4 2xl:mt-20 2xl:mb-10">
                <div className="flex flex-col items-center justify-center">
                    <div className="m-auto w-full text-center">
                        <h1 className="mb-2 font-title text-4xl font-bold text-stone-800 dark:text-white 2xl:text-6xl 2xl:mb-6">crontab.run</h1>
                        <p className="text-xs m-auto text-stone-600 dark:text-stone-400 2xl:text-lg">Fast and easy to
                            use
                            cron expression evaluator.</p>
                    </div>
                </div>
            </div>
            <div
                className="w-full text-center 2xl:py-4 text-xl 2xl:text-2xl italic 2xl:h-16 py-1 min-h-10 2xL:mt-10 mt-2">
                {!expErr ? tips : ''}
            </div>
            <div className="md:w-1/2 w-full">
                <input
                    type="text"
                    className={"crontab-input w-full p-3 text-2xl 2xl:text-4xl text-center rounded-lg placeholder-gray-500 dark:placeholder-gray-300 dark:bg-gray-800 dark:text-gray-200 font-bold border-2 " + (expErr ? "border-red-500" : "border-transparent")}
                    id="expression"
                    placeholder=""
                    ref={inputRef}
                    onKeyUp={handleKeyUp}
                    onClick={handleClick}
                    onChange={handleChange}
                    onBlur={handleInputBlur}
                    value={value}
                    autoComplete="off"
                />
            </div>
            <div className="w-full text-center m-4 font-medium text-xs 2xl:text-xl md:text-lg overflow-x-auto">
                {
                    tabs.map((item) => {
                        return (
                            <span
                                className={"px-2 md:px-5 " + (!expErr && inputState && positionType === item[0] ? 'text-indigo-600' : '')}
                                key={item[0]}>{item[1]}</span>
                        )
                    })
                }
            </div>
            {
                !expErr && result.length > 0 ? (

                        <div
                            className="md:w-1/2 w-full flex mt-2 mb-2 2xl:mt-5 2xl:mb-5 overflow-x-auto max-w-2xl 2xl:max-w-3xl border">
                            <div className="w-1/2">
                                <table className="items-center w-full bg-transparent border-collapse">
                                    <thead>
                                    <tr>
                                        <th
                                            className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                                            Next 5 Result
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody
                                        className="divide-y divide-gray-100 text-xs 2xl:text-xl md:text-base font-normal">
                                    {
                                        result.map((item, key) => {
                                            return (
                                                <tr className="text-gray-500" key={item}>
                                                    <td className="border-t-0 px-4 align-middle whitespace-nowrap p-2 2xl:p-3 text-left">
                                                        {(key + 1) + '. ' + item}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className="w-1/2">
                                {!expErr ?
                                    <table
                                        className="items-center w-full bg-transparent border-collapse text-xs font-semibold">
                                        <thead>
                                        <tr>
                                            <th className="px-1 bg-gray-50 text-gray-700 align-middle py-3 text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                                                Rule
                                            </th>
                                            <th className="px-2 bg-gray-50 text-gray-700 align-middle py-3 text-left uppercase border-l-0 border-r-0 whitespace-nowrap">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody
                                            className="divide-y divide-gray-100 text-xs 2xl:text-xl md:text-base font-normal">
                                        {
                                            rule['normal'].map((item, key) => {
                                                return (
                                                    <tr className="text-gray-500" key={item[0]}>
                                                        <th className="w-1/3 border-t-0 px-1 align-middle whitespace-nowrap p-2 2xl:p-3 text-center">
                                                            {item[0]}
                                                        </th>
                                                        <td className="w-2/3 border-t-0 px-0 align-middle whitespace-nowrap p-2 2xl:p-3 text-left">
                                                            {item[1]}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        {
                                            rules.map((item, key) => {
                                                return (
                                                    <tr className="text-gray-500" key={item[0]}>
                                                        <th className="border-t-0 px-1 align-middle whitespace-nowrap p-2 2xl:p-3 text-center">
                                                            {item[0]}
                                                        </th>
                                                        <td className="border-t-0 px-2 align-middle whitespace-nowrap p-2 2xl:p-3 text-left">
                                                            {item[1]}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </table>
                                    : ''
                                }
                            </div>
                        </div>
                    )
                    : ''
            }

            <div className="py-2 2xl:py-4 w-full mt-auto border-t flex items-center justify-center z-20 text-xs">
                <p>© 2024 <a target="_blank" className=" duration-150 hover:text-zinc-200"
                             href="https://crontab.run">Crontab.Run</a>
                </p>
                <a target="_blank" aria-label="GitHub" className="ml-10 duration-150 hover:text-zinc-200"
                   href="https://github.com/AiLaunchers/crontab.run">
                    <svg aria-label="github" height="14" viewBox="0 0 14 14" width="14">
                        <path
                            d="M7 .175c-3.872 0-7 3.128-7 7 0 3.084 2.013 5.71 4.79 6.65.35.066.482-.153.482-.328v-1.181c-1.947.415-2.363-.941-2.363-.941-.328-.81-.787-1.028-.787-1.028-.634-.438.044-.416.044-.416.7.044 1.071.722 1.071.722.635 1.072 1.641.766 2.035.59.066-.459.24-.765.437-.94-1.553-.175-3.193-.787-3.193-3.456 0-.766.262-1.378.721-1.881-.065-.175-.306-.897.066-1.86 0 0 .59-.197 1.925.722a6.754 6.754 0 0 1 1.75-.24c.59 0 1.203.087 1.75.24 1.335-.897 1.925-.722 1.925-.722.372.963.131 1.685.066 1.86.46.48.722 1.115.722 1.88 0 2.691-1.641 3.282-3.194 3.457.24.219.481.634.481 1.29v1.926c0 .197.131.415.481.328C11.988 12.884 14 10.259 14 7.175c0-3.872-3.128-7-7-7z"
                            fill="currentColor" fillRule="nonzero"></path>
                    </svg>
                </a>
            </div>
        </main>
    );
}
