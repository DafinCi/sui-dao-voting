import { useCurrentWallet } from "@mysten/dapp-kit";
import { WifiOff } from "lucide-react";

export const NetworkGuard = () => {
  const { currentWallet, connectionStatus } = useCurrentWallet();

  const isWrongNetwork =
    connectionStatus === "connected" &&
    currentWallet?.accounts[0]?.chains?.[0] &&
    !currentWallet.accounts[0].chains[0].includes("testnet");

  if (!isWrongNetwork) return null;

  return (
    <div className="bg-red-500/90 text-white text-center py-2 px-4 text-sm font-mono flex justify-center items-center gap-2 fixed top-16 left-0 right-0 z-30 backdrop-blur-md">
      <WifiOff size={16} />
      Warning: You are on the wrong network. Please switch to Sui Testnet.
    </div>
  );
};
