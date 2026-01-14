
import React from 'react';
import { ArrowRight, Warning } from '@phosphor-icons/react';

function PromptResultRow({ item, idx, setViewRaw, type }) {
    // Explicit color mapping for badges based on type
    const isCustom = type === 'custom';

    return (
        <tr className={`transition-colors ${isCustom ? 'hover:bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
            <td className="px-6 py-4 align-top">
                <div className="flex items-center gap-2 mb-1">
                    {isCustom ? (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                            Custom
                        </span>
                    ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-slate-200">
                            System
                        </span>
                    )}
                </div>
                <div className="text-sm font-medium text-slate-900 mb-1">{item.prompt}</div>
                <button
                    onClick={() => setViewRaw(item)}
                    className="text-[10px] uppercase font-bold text-amber-600 hover:text-amber-700 hover:underline tracking-wide bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1"
                >
                    View Raw Output <ArrowRight size={10} />
                </button>
            </td>
            <td className="px-6 py-4 align-top">
                <div className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border
                    ${item.analysis.citation_level === 'STRONG_CITATION' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.analysis.citation_level === 'DEFINITION_OWNERSHIP' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            item.analysis.citation_level === 'MENTION_ONLY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                item.analysis.citation_level === 'ERROR' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'}
                `}>
                    {item.analysis.citation_level?.replace('_', ' ') || 'UNKNOWN'}
                </div>
                <div className="mt-2 text-xs text-slate-400 font-mono">
                    Trust Score: {item.analysis.confidence_score}%
                </div>
            </td>
            <td className="px-6 py-4 align-top text-sm text-slate-600">
                {item.analysis.citation_sentence && (
                    <div className="mb-2 p-2 bg-slate-50 rounded italic border-l-2 border-slate-300">
                        "{item.analysis.citation_sentence}"
                    </div>
                )}
                {item.analysis.why_not_cited && (
                    <div className="text-red-500 text-xs font-medium flex items-center gap-1">
                        <Warning size={12} weight="fill" />
                        {item.analysis.why_not_cited}
                    </div>
                )}
            </td>
        </tr>
    );
}

export default PromptResultRow;
