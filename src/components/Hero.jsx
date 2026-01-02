import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Paths for Real AI Brands
const LOGOS = [
    {
        name: "Gemini",
        color: "text-[#4E88FC]", // Google Blue/Gradient
        path: (
            // Official Google Gemini Icon Path (Star/Sparkle)
            <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="currentColor" />
        )
    },
    {
        name: "ChatGPT",
        color: "text-[#10A37F]", // OpenAI Green
        path: (
            // Official OpenAI Icon Path (Swirl/Hexagon Flower)
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="currentColor" />
        )
    },
    {
        name: "Perplexity",
        color: "text-[#22B3B8]", // Perplexity Teal
        path: (
            // Official Perplexity Icon Path
            <path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z" fill="currentColor" />
        )
    },
    {
        name: "Grok",
        color: "text-slate-900", // xAI Black
        path: (
            // xAI / Grok Logo (X shape)
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" />
        )
    }
];

export default function Hero() {
    return (
        <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 leading-[1.1]">
                        Track <span className="font-serif italic font-light text-6xl md:text-8xl text-indigo-500 mx-1">&</span> Boost Your Brand
                    </h1>
                    <div className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 mt-2 flex flex-wrap items-center justify-center gap-3">
                        <span>in</span>
                        <div className="bg-white shadow-xl rounded-2xl px-2 flex items-center justify-center h-[1.1em] w-[1.1em] overflow-hidden border border-slate-200/80 relative">
                            {/* Vertical Scrolling Logos */}
                            <motion.div
                                animate={{ y: ["0%", "-50%"] }} // Scroll exactly half (the length of original list)
                                transition={{
                                    repeat: Infinity,
                                    duration: 8, // Slightly faster for 4 items
                                    ease: "linear",
                                    repeatType: "loop"
                                }}
                                className="flex flex-col items-center justify-start"
                            >
                                {/* Double list for seamless loop */}
                                {[...LOGOS, ...LOGOS].map((logo, i) => (
                                    <div key={i} className="flex-shrink-0 h-[1.1em] w-[1.1em] flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className={`w-[70%] h-[70%] ${logo.color} fill-current`}>
                                            {logo.path}
                                        </svg>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                        <span>AI Search</span>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 mb-10"
                >
                    Stop writing for just keywords. Start optimizing for Large Language Models.
                    Discover what users ask and generate authoritative answers instantly.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link to="/optimizer" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-brand-700 hover:bg-brand-800 shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1 active:scale-95 group">
                        Try the Optimizer
                        <ArrowRight className="ml-2 text-lg group-hover:translate-x-1 transition-transform" weight="bold" />
                    </Link>
                    <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95">
                        View Demo
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
