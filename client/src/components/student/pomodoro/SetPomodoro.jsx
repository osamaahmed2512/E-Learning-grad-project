import { useState } from "react";
import PropTypes from 'prop-types';
import Button from "./Button";

const SetPomodoro = ({ onSubmit }) => {
    const [newTimer, setNewTimer] = useState({
        work: 25,
        short: 5,
        long: 20,
        custom: 0,
        active: "work",
    });
    const [showCustom, setShowCustom] = useState(false);

    const handleChange = (input) => {
        const { name, value } = input.target;
        const numericValue = value === "" ? 0 : parseInt(value);

        switch (name) {
            case "work":
                setNewTimer({ ...newTimer, work: numericValue });
                break;
            case "shortBreak":
                setNewTimer({ ...newTimer, short: numericValue });
                break;
            case "longBreak":
                setNewTimer({ ...newTimer, long: numericValue });
                break;
            case "custom":
                setNewTimer({ ...newTimer, custom: numericValue, active: "custom" });
                break;
            default:
                break;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newTimer);
    };

    const toggleCustom = () => {
        setShowCustom(!showCustom);
    };

    return (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center">
                        <label htmlFor="work" className="text-sm font-semibold text-gray-700 mb-2">
                            Work Time
                        </label>
                        <input
                            id="work"
                            className="w-24 h-24 rounded-full bg-white shadow-inner text-center text-xl 
                                     font-semibold text-gray-800 border border-gray-200 cursor-pointer
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="work"
                            type="number"
                            min="1"
                            max="60"
                            onChange={handleChange}
                            value={newTimer.work}
                        />
                        <span className="text-xs text-gray-500 mt-2">minutes</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <label htmlFor="shortBreak" className="text-sm font-semibold text-gray-700 mb-2">
                            Short Break
                        </label>
                        <input
                            id="shortBreak"
                            className="w-24 h-24 rounded-full bg-white shadow-inner text-center text-xl 
                                     font-semibold text-gray-800 border border-gray-200 cursor-pointer
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="shortBreak"
                            type="number"
                            min="1"
                            max="30"
                            onChange={handleChange}
                            value={newTimer.short}
                        />
                        <span className="text-xs text-gray-500 mt-2">minutes</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <label htmlFor="longBreak" className="text-sm font-semibold text-gray-700 mb-2">
                            Long Break
                        </label>
                        <input
                            id="longBreak"
                            className="w-24 h-24 rounded-full bg-white shadow-inner text-center text-xl 
                                     font-semibold text-gray-800 border border-gray-200 cursor-pointer
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="longBreak"
                            type="number"
                            min="1"
                            max="60"
                            onChange={handleChange}
                            value={newTimer.long}
                        />
                        <span className="text-xs text-gray-500 mt-2">minutes</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Button 
                        title="Add Custom Timer" 
                        _callback={toggleCustom}
                    />

                    {showCustom && (
                        <div className="flex flex-col items-center">
                            <label htmlFor="custom" className="text-sm font-semibold text-gray-700 mb-2">
                                Custom Timer
                            </label>
                            <input
                                id="custom"
                                className="w-24 h-24 rounded-full bg-white shadow-inner text-center text-xl 
                                         font-semibold text-gray-800 border border-gray-200 cursor-pointer
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                name="custom"
                                type="number"
                                min="1"
                                max="120"
                                onChange={handleChange}
                                value={newTimer.custom}
                            />
                            <span className="text-xs text-gray-500 mt-2">minutes</span>
                        </div>
                    )}

                    <Button 
                        title="Set Timer" 
                        _callback={handleSubmit}
                        activeClass="active-label"
                    />
                </div>
            </form>
        </div>
    );
};

SetPomodoro.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export default SetPomodoro;