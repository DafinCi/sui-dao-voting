import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { LandingPage } from "./pages/LandingPage";
import { ProposalsPage } from "./pages/ProposalsPage";
import { ProposalDetail } from "./pages/ProposalDetail";
import { CreatePage } from "./pages/CreatePage";
import { ResultsPage } from "./pages/ResultsPage";
import { ResultDetail } from "./pages/ResultDetail";

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative font-mono selection:bg-sui-blue selection:text-white pb-20 bg-sui-dark text-white transition-colors duration-300">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161B22",
              color: "#fff",
              border: "1px solid #30363d",
            },
          }}
        />
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/proposal/:id" element={<ProposalDetail />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/result/:id" element={<ResultDetail />} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
