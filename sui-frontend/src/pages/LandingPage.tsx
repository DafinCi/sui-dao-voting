import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const LandingPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="pt-10 pb-32 px-6 min-h-[80vh] flex flex-col justify-center text-center"
  >
    <div className="max-w-2xl mx-auto">
      <div className="inline-block px-3 py-1 mb-6 rounded-full border border-sui-blue/30 bg-sui-blue/10 text-sui-blue font-mono text-xs animate-pulse">
        &lt;DAO&gt; Live on Testnet &lt;/DAO&gt;
      </div>
      <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-6 text-white">
        SUI <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sui-blue via-sui-cyan to-sui-purple">
          VOTING
        </span>
      </h1>
      <p className="text-gray-400 text-lg mb-10 font-mono font-medium">
        Decentralized governance. Transparent. Secure.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/proposals"
          className="px-8 py-4 bg-sui-blue text-white font-display font-bold text-lg rounded-xl shadow-[4px_4px_0px_#2563EB] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          Vote Now <ArrowRight size={20} />
        </Link>
        <Link
          to="/results"
          className="px-8 py-4 bg-sui-card border-2 border-white/20 text-white font-bold text-lg rounded-xl transition-all hover:bg-white/5 active:scale-95"
        >
          See Results
        </Link>
      </div>
    </div>
  </motion.div>
);
