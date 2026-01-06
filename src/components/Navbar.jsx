import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    GoogleLogo,
    SignOut,
    User,
    CaretDown,
    Brain,
    Sparkle,
    YoutubeLogo,
    TrendUp,
    Quotes,
    ChartLineUp,
    MagicWand,
    MagnifyingGlass
} from '@phosphor-icons/react';

export default function Navbar() {
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Failed to log in", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const products = {
        core: {
            title: "Core Platform",
            items: [
                { name: "GEO Brand Audit", desc: "Simulate AI perception of your brand", icon: Brain, bg: "bg-violet-50 text-violet-600", path: "/brand-audit" },
                { name: "AI Visibility Monitor", desc: "Track share of voice vs competitors", icon: ChartLineUp, bg: "bg-emerald-50 text-emerald-600", path: "/ai-monitor" },
                { name: "Citation Intelligence", desc: "Check authority and fix citations", icon: Quotes, bg: "bg-amber-50 text-amber-600", path: "/citation-intelligence" },
                { name: "Prompt Drift Monitor", desc: "Detect stability issues in AI responses", icon: TrendUp, bg: "bg-rose-50 text-rose-600", path: "/prompt-drift" },
            ]
        },
        tools: {
            title: "Optimization Suite",
            items: [
                { name: "AI Content Optimizer", desc: "Generate citation-optimized answers", icon: Sparkle, bg: "bg-purple-50 text-purple-600", path: "/optimizer" },
                { name: "Script Optimizer", desc: "Convert scripts for AI readability", icon: MagicWand, bg: "bg-indigo-50 text-indigo-600", path: "/script-optimizer" },
                { name: "YouTube Optimizer", desc: "Rank videos in multimodal search", icon: YoutubeLogo, bg: "bg-red-50 text-red-600", path: "/youtube-optimizer" },
                { name: "AI Questioner", desc: "Discover high-intent user questions", icon: MagnifyingGlass, bg: "bg-blue-50 text-blue-600", path: "/questioner" },
            ]
        }
    };

    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300 clean-panel border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                        <span className="font-display font-medium text-3xl tracking-tight text-slate-900 flex items-center">
                            c
                            <span className="w-10 h-4 border-[3px] border-slate-900 rounded-full inline-block mx-0.5 translate-y-[1px]"></span>
                            ar.ai
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </Link>

                        {/* Products Dropdown */}
                        <div
                            className="relative group"
                            onMouseEnter={() => setIsProductsOpen(true)}
                            onMouseLeave={() => setIsProductsOpen(false)}
                        >
                            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors group-hover:text-brand-600 py-2">
                                Products
                                <CaretDown weight="bold" className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[600px] transition-all duration-200 origin-top ${isProductsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-2 gap-8 ring-1 ring-slate-900/5">
                                    {/* Column 1: Core Platform */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900">{products.core.title}</h3>
                                        <div className="space-y-2">
                                            {products.core.items.map((item, idx) => (
                                                <Link key={idx} to={item.path} className="flex items-start gap-4 p-2 rounded-xl group/item hover:bg-slate-50 transition-colors">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                                                        <item.icon weight="duotone" className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-900 group-hover/item:text-brand-600 transition-colors">{item.name}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Column 2: Optimization Suite */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900">{products.tools.title}</h3>
                                        <div className="space-y-2">
                                            {products.tools.items.map((item, idx) => (
                                                <Link key={idx} to={item.path} className="flex items-start gap-4 p-2 rounded-xl group/item hover:bg-slate-50 transition-colors">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                                                        <item.icon weight="duotone" className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-900 group-hover/item:text-brand-600 transition-colors">{item.name}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            About Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </Link>
                        <a href="/#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </a>

                        <a href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            Pricing
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </a>

                    </div>
                    <div>
                        {currentUser ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <User className="w-6 h-6 text-slate-600" />
                                    )}
                                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{currentUser.displayName || 'User'}</span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-fade-in">
                                        <div className="px-4 py-2 border-b border-slate-50">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <SignOut />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 gap-2"
                            >
                                <GoogleLogo weight="bold" />
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
