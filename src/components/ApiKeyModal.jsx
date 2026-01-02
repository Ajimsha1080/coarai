import React, { useState, useEffect } from 'react';
import { Key } from '@phosphor-icons/react';

export default function ApiKeyModal({ isOpen, onClose, onSave }) {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKey('');
            setError('');
        }
    }, [isOpen]);

    const handleSave = () => {
        const key = apiKey.trim();
        if (key.length < 10) {
            setError('Please enter a valid API key.');
            return;
        }
        onSave(key);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity"></div>
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <Key className="text-brand-600 text-xl" weight="bold" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">Enter Gemini API Key</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500 mb-4">
                                            To use the AI Content Optimizer, you need a valid Google Gemini API key. It will be stored locally in your browser.
                                        </p>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                            placeholder="Paste your API key here (starts with AIza...)"
                                        />
                                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex w-full justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 sm:ml-3 sm:w-auto transition-colors"
                            >
                                Save & Continue
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
