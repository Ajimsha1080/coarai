import React from 'react';
import { TwitterLogo, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="font-display font-medium text-xl tracking-tight text-slate-900 flex items-center">
                    c
                    <span className="w-6 h-3 border-[2px] border-slate-900 rounded-full inline-block mx-0.5 translate-y-[0.5px]"></span>
                    ar.ai
                </span>
                <div className="text-slate-500 text-sm">
                    &copy; 2025 COAR. All rights reserved.
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
