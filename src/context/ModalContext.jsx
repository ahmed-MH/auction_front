import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
        variant: 'info', // 'success' | 'error' | 'warning' | 'info'
        message: '',
        title: '',
    });

    // We use a ref to store the resolve function of the current promise
    const resolveRef = useRef(null);

    const close = useCallback(() => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(false); // Default to false/unconfirmed on close
            resolveRef.current = null;
        }
    }, []);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setModalState({
                isOpen: true,
                type: 'confirm',
                variant: options.variant || 'warning',
                message,
                title: options.title || 'Confirmation',
            });
        });
    }, []);

    const alert = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setModalState({
                isOpen: true,
                type: 'alert',
                variant: options.variant || 'info', // Default variant
                message,
                title: options.title || 'Information',
            });
        });
    }, []);

    const handleConfirm = () => {
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        close();
    };

    // UI Helpers
    const getIcon = () => {
        switch (modalState.variant) {
            case 'success': return <CheckCircle className="w-10 h-10 text-green-500" />;
            case 'error': return <AlertCircle className="w-10 h-10 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-10 h-10 text-orange-500" />;
            default: return <Info className="w-10 h-10 text-blue-500" />;
        }
    };

    const getButtonStyles = () => {
        switch (modalState.variant) {
            case 'success': return "bg-green-600 hover:bg-green-700 focus:ring-green-200";
            case 'error': return "bg-red-600 hover:bg-red-700 focus:ring-red-200";
            case 'warning': return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-200";
            default: return "bg-[#014152] hover:bg-[#025a70] focus:ring-blue-200";
        }
    };

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}

            {/* Global Modal Overlay */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative transform transition-all scale-100 animate-slideUp">

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 p-3 bg-gray-50 rounded-full">
                                {getIcon()}
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {modalState.title}
                            </h3>

                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {modalState.message}
                            </p>

                            <div className="flex gap-3 w-full">
                                {modalState.type === 'confirm' && (
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    >
                                        Cancel
                                    </button>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium shadow-md transition-all focus:outline-none focus:ring-4 ${getButtonStyles()}`}
                                >
                                    {modalState.type === 'confirm' ? 'Confirm' : 'OK'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};
