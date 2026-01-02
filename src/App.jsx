import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import OptimizerPage from './pages/Optimizer';
import QuestionerPage from './pages/Questioner';
import SeoAuditPage from './pages/SeoAudit';
import BrandAuditPage from './pages/BrandAudit';

import ScriptGeoOptimizerPage from './pages/ScriptGeoOptimizerPage';
import PromptDriftPage from './pages/PromptDriftPage';
const AiMonitorPage = React.lazy(() => import('./pages/ai-monitor/AiMonitorPage'));
import Footer from './components/Footer';

// ------------------------------------------------------------------
// 🔑 PASTE YOUR GEMINI API KEY BELOW
// ------------------------------------------------------------------
const API_KEY = "AIzaSyDyJFCIxRLlhDknGXQGqFXQ2_ozg1J9gAM"; // Updated manually
const TAVILY_API_KEY = "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"; // PASTE TAVILY KEY HERE
// ------------------------------------------------------------------

function App() {
  return (
    <Router>
      <div className="bg-white font-serif text-dark-800 antialiased selection:bg-brand-200 selection:text-brand-900 min-h-screen relative flex flex-col">
        {/* Background Decoration */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-y-1/3 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl"></div>
        </div>

        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/questioner"
              element={
                <QuestionerPage
                  apiKey={API_KEY}
                  tavilyApiKey={TAVILY_API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
            <Route
              path="/optimizer"
              element={
                <OptimizerPage
                  apiKey={API_KEY}
                  tavilyApiKey={TAVILY_API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
            <Route
              path="/seo-audit"
              element={
                <SeoAuditPage
                  apiKey={API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
            <Route
              path="/brand-audit"
              element={
                <BrandAuditPage
                  apiKey={API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
            <Route
              path="/ai-monitor"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <AiMonitorPage apiKey={API_KEY} />
                </React.Suspense>
              }
            />
            <Route
              path="/script-optimizer"
              element={
                <ScriptGeoOptimizerPage
                  apiKey={API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
            <Route
              path="/prompt-drift"
              element={
                <PromptDriftPage
                  apiKey={API_KEY}
                  onRequireApiKey={() => alert("Please paste your API Key in src/App.jsx line 9")}
                />
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
