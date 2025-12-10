import { ConnectButton } from "@mysten/dapp-kit";
import { NetworkGuard } from "./NetworkGuard";

export const Header = () => (
  <header className="sticky top-0 z-40 bg-sui-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter text-white">
        <div className="w-8 h-8 bg-gradient-to-br from-sui-blue to-sui-cyan rounded-lg flex items-center justify-center text-black shadow-lg shadow-sui-blue/20">
          S
        </div>
        Web3DevSolo
      </div>
      <div className="flex items-center gap-3">
        <ConnectButton className="!bg-white/10 !text-white !font-mono !border-none !rounded-full hover:!bg-white/20 transition-all active:scale-95" />
      </div>
    </div>
    <NetworkGuard />
  </header>
);
