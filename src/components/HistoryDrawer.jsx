import React from 'react';
import { X, Clock, CaretRight } from '@phosphor-icons/react';

export default function HistoryDrawer({ isOpen, onClose, historyItems, onLoadItem }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-in-right overflow-y-auto">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex justify-between items-center z-10">
                    <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                        <Clock weight="fill" className="text-brand-500" />
                        History
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X weight="bold" className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {historyItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Clock className="text-4xl mx-auto mb-3 opacity-20" />
                            <p>No history yet. Start optimizing!</p>
                        </div>
                    ) : (
                        historyItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onLoadItem(item); onClose(); }}
                                className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-900 line-clamp-1">{item.topic}</h3>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                        {item.createdAt?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    {item.questionsAnalysis?.substring(0, 100)}...
                                </p>
                                <div className="mt-3 flex items-center text-xs font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Load Result <CaretRight className="ml-1" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
