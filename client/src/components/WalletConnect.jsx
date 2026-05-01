import { useState } from "react";
import { connectWallet } from "../services/blockchain.js";

function WalletConnect({ onConnected }) {
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  const handleConnect = async () => {
    try {
      setError("");
      const { address } = await connectWallet();
      setWallet(address);
      onConnected?.(address);
    } catch (connectError) {
      setError(connectError.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Wallet</p>
          <p className="text-sm text-white">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect MetaMask to use escrow"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white"
        >
          Connect Wallet
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}

export default WalletConnect;

