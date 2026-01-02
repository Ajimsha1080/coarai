import React from 'react';
import { TwitterLogo, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs">P</div>
                    <span className="font-display font-bold text-slate-900">Prompting Co.</span>
                </div>
                <div className="text-slate-500 text-sm">
                    &copy; 2025 The Prompting Co. All rights reserved.
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors transform hover:scale-110">
                        <TwitterLogo className="text-xl" weight="fill" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors transform hover:scale-110">
                        <GithubLogo className="text-xl" weight="fill" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors transform hover:scale-110">
                        <LinkedinLogo className="text-xl" weight="fill" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
