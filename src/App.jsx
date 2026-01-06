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

// ✅ Lazy-loaded page (path must match EXACT folder name)
const AiMonitorPage = React.lazy(
    () => import('./pages/aimonitor/AiMonitorPage')
);

// 🔒 NEVER put API keys in frontend
// 🔒 API Keys loaded from Environment Variables
const API_KEY = import.meta.env.VITE_GOOGLE_GEN_AI_KEY;
// wrapper to allow standard TAVILY_API_KEY or VITE_TAVILY_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || import.meta.env.TAVILY_API_KEY;

import { useState, useEffect } from 'react';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
    return (
        <Router>
            <div className="bg-slate-50 font-sans text-dark-800 antialiased min-h-screen flex flex-col relative">

                {/* Background decoration */}
                {/* Animated Background decoration */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.4, 0.3],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-200/30 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute bottom-0 right-0 translate-y-1/3 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl"
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
