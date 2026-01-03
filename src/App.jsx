import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// ✅ Lazy-loaded page (path must match EXACT folder name)
const AiMonitorPage = React.lazy(
  () => import('./pages/aimonitor/AiMonitorPage')
);

// 🔒 NEVER put API keys in frontend
const API_KEY = null;
const TAVILY_API_KEY = null;

function App() {
  return (
    <Router>
      <div className="bg-white font-serif text-dark-800 antialiased min-h-screen flex flex-col relative">

        {/* Background decoration */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-y-1/3 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl"></div>
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
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
