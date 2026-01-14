import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import OptimizerPage from './pages/Optimizer';
import QuestionerPage from './pages/Questioner';
import SeoAuditPage from './pages/SeoAudit';
import BrandAuditPage from './pages/BrandAudit';
import ScriptGeoOptimizerPage from './pages/ScriptGeoOptimizerPage';
import PromptDriftPage from './pages/PromptDriftPage';
import YouTubeOptimizer from './pages/YouTubeOptimizer';
import CitationIntelligencePage from './pages/CitationIntelligencePage';
import PromptVisibilityPage from './pages/PromptVisibilityPage';

// ✅ Lazy-loaded page (path must match EXACT folder name)
const AiMonitorPage = React.lazy(
    () => import('./pages/aimonitor/AiMonitorPage')
);

// 🔒 NEVER put API keys in frontend
// 🔒 API Keys loaded from Environment Variables
const API_KEY = import.meta.env.VITE_GOOGLE_GEN_AI_KEY;
console.log("DEBUG: API_KEY Loaded:", API_KEY ? "Yes (starts with " + API_KEY.substring(0, 5) + ")" : "No (Undefined)");
// wrapper to allow standard TAVILY_API_KEY or VITE_TAVILY_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || import.meta.env.TAVILY_API_KEY;

import { useState, useEffect } from 'react';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
    return (
        <Router>
            <div className="bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col relative transition-colors duration-300">

                {/* Background decoration */}
                {/* Animated Background decoration */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

                    {/* Orb 1 - Top Left */}
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-400/20 rounded-full blur-[100px]"
                    />

                    {/* Orb 2 - Bottom Right */}
                    <motion.div
                        animate={{
                            x: [0, -40, 0],
                            y: [0, -60, 0],
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-400/20 rounded-full blur-[100px]"
                    />

                    {/* Orb 3 - Center (Floating) */}
                    <motion.div
                        animate={{
                            x: [0, 100, -100, 0],
                            y: [0, -50, 50, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-300/10 rounded-full blur-[120px]"
                    />
                </div>

                <Navbar />

                {/* ✅ WRAP ENTIRE ROUTES WITH SUSPENSE */}
                <main className="flex-grow relative z-10">
                    <Suspense fallback={<div className="p-6">Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />

                            <Route
                                path="/questioner"
                                element={
                                    <QuestionerPage
                                        apiKey={API_KEY}
                                        tavilyApiKey={TAVILY_API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/optimizer"
                                element={
                                    <OptimizerPage
                                        apiKey={API_KEY}
                                        tavilyApiKey={TAVILY_API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/seo-audit"
                                element={
                                    <SeoAuditPage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/brand-audit"
                                element={
                                    <BrandAuditPage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/ai-monitor"
                                element={<AiMonitorPage apiKey={API_KEY} />}
                            />

                            <Route
                                path="/script-optimizer"
                                element={
                                    <ScriptGeoOptimizerPage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            <Route
                                path="/prompt-drift"
                                element={
                                    <PromptDriftPage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />
                            <Route
                                path="/youtube-optimizer"
                                element={
                                    <YouTubeOptimizer
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />
                            <Route
                                path="/citation-intelligence"
                                element={
                                    <CitationIntelligencePage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />
                            <Route
                                path="/prompt-visibility"
                                element={
                                    <PromptVisibilityPage
                                        apiKey={API_KEY}
                                        onRequireApiKey={() =>
                                            alert('Backend not configured yet')
                                        }
                                    />
                                }
                            />

                            {/* 404 Catch-All */}
                            <Route path="*" element={
                                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                                    <h1 className="text-6xl font-display font-bold text-slate-900 mb-4">404</h1>
                                    <p className="text-xl text-slate-600 mb-8">Page not found. Did you mean <a href="/prompt-drift" className="text-amber-600 hover:underline">Prompt Drift</a>?</p>
                                    <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                                        Return Home
                                    </Link>
                                </div>
                            } />
                        </Routes>
                    </Suspense>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;
