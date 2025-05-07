import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiClock, FiCoffee, FiX, FiCheck } from 'react-icons/fi';
import { MdWorkOutline } from 'react-icons/md';
import PropTypes from 'prop-types';

const CustomTimerModal = ({ isOpen, closeModal, onSave }) => {
    const [customTimers, setCustomTimers] = useState({
        work: 25,
        break: 5
    });

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeModal]);

    const handleChange = (type, value) => {
        let num = parseInt(value) || 0;
        if (type === 'work') {
            num = Math.min(Math.max(num, 1), 120); // Between 1 and 120
        } else {
            num = Math.min(Math.max(num, 1), 60); // Between 1 and 60
        }
        setCustomTimers(prev => ({
            ...prev,
            [type]: num
        }));
    };

    const handleManualInput = (type, e) => {
        const value = e.target.value;
        if (value === '' || /^\d{1,3}$/.test(value)) {
            setCustomTimers(prev => ({
                ...prev,
                [type]: value === '' ? '' : parseInt(value)
            }));
        }
    };

    const handleSave = () => {
        if (customTimers.work > 0 && customTimers.break > 0) {
            onSave(customTimers);
            closeModal();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-sm md:max-w-md transform overflow-hidden 
                                                  rounded-2xl bg-white p-6 md:p-8 shadow-xl transition-all
                                                  border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-lg md:text-xl font-semibold leading-6 
                                                          text-gray-900 flex items-center gap-2">
                                        <FiClock className="text-indigo-600 animate-pulse" />
                                        Custom Timer Settings
                                    </Dialog.Title>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 transition-colors 
                                                 rounded-lg p-2 hover:bg-gray-100"
                                        onClick={closeModal}
                                        title="Press ESC to close"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 
                                                      p-4 md:p-6 rounded-xl border border-gray-100 
                                                      hover:shadow-md transition-shadow">
                                            <label className="flex items-center gap-2 text-sm font-medium 
                                                          text-gray-700 mb-3">
                                                <MdWorkOutline className="text-indigo-600 w-5 h-5" />
                                                Work Duration
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={customTimers.work}
                                                    onChange={(e) => handleManualInput('work', e)}
                                                    onBlur={(e) => handleChange('work', e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 shadow-sm 
                                                             focus:border-indigo-500 focus:ring-indigo-500 
                                                             text-base md:text-lg font-medium text-center
                                                             hover:border-indigo-300 transition-colors"
                                                    placeholder="25"
                                                />
                                                <span className="text-sm text-gray-500 min-w-[60px]">minutes</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <span className="block w-1 h-1 rounded-full bg-indigo-400"></span>
                                                Enter a value between 1 and 120 minutes
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 
                                                      p-4 md:p-6 rounded-xl border border-gray-100
                                                      hover:shadow-md transition-shadow">
                                            <label className="flex items-center gap-2 text-sm font-medium 
                                                          text-gray-700 mb-3">
                                                <FiCoffee className="text-indigo-600 w-5 h-5" />
                                                Break Duration
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={customTimers.break}
                                                    onChange={(e) => handleManualInput('break', e)}
                                                    onBlur={(e) => handleChange('break', e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 shadow-sm 
                                                             focus:border-indigo-500 focus:ring-indigo-500 
                                                             text-base md:text-lg font-medium text-center
                                                             hover:border-indigo-300 transition-colors"
                                                    placeholder="5"
                                                />
                                                <span className="text-sm text-gray-500 min-w-[60px]">minutes</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <span className="block w-1 h-1 rounded-full bg-indigo-400"></span>
                                                Enter a value between 1 and 60 minutes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <button
                                            type="button"
                                            className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm 
                                                     font-medium rounded-lg hover:bg-gray-50 transition-colors
                                                     flex items-center gap-2"
                                            onClick={closeModal}
                                        >
                                            <FiX className="w-4 h-4" />
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg 
                                                     bg-gradient-to-r from-indigo-600 to-indigo-700 
                                                     px-4 py-2 text-sm font-medium text-white 
                                                     hover:from-indigo-700 hover:to-indigo-800 
                                                     focus:outline-none focus-visible:ring-2 
                                                     focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                                     hover:shadow-md active:transform active:scale-95"
                                            onClick={handleSave}
                                            disabled={!customTimers.work || !customTimers.break}
                                        >
                                            <FiCheck className="w-4 h-4" />
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

CustomTimerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default CustomTimerModal;