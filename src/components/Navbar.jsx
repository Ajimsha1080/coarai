import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogo, SignOut, User } from '@phosphor-icons/react';

export default function Navbar() {
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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

    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300 clean-panel border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold font-display text-lg shadow-md">
                            C
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900">COAR</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            About Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </Link>
                        <a href="/#products" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group">
                            Products
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
                        </a>
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
