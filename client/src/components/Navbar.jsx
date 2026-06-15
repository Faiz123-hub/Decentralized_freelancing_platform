import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { addStableCoinToWallet, connectWallet, getStableCoinBalances } from "../services/blockchain.js";
import { defaultWalletsByRole } from "../utils/defaultWallets.js";
import RoleBadge from "./RoleBadge.jsx";

function WalletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 flex-none"
      viewBox="0 0 64 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 16.5c0-3.6 2.9-6.5 6.5-6.5h28.2L27.8 18H16.5a6.5 6.5 0 0 1 0-13h12.2L45 3.4a4 4 0 0 1 5.4 1.8L56.7 18h-7.4l-4-8-16.2 8H54c4.4 0 8 3.6 8 8v5H52.5a12.5 12.5 0 0 0 0 25H62v4c0 4.4-3.6 8-8 8H13c-6.1 0-11-4.9-11-11V19.5c0-1.7.7-3.3 1.8-4.4A13.4 13.4 0 0 0 10 16.5Z" />
      <path d="M52.5 35H64v17H52.5a8.5 8.5 0 0 1 0-17Zm1.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [stableCoins, setStableCoins] = useState([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);
  const [demoTransfer, setDemoTransfer] = useState({
    sentEth: 0,
    receivedEth: 0,
    lastDirection: ""
  });

  useEffect(() => {
    if (!window.ethereum?.on) {
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      setWallet(accounts?.[0] || "");
      setStableCoins([]);
      setWalletError("");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const handleWalletConnect = async () => {
    try {
      setWalletError("");
      const { address } = await connectWallet();
      setWallet(address);
      setIsWalletOpen(true);
      await loadStableCoins();
    } catch (error) {
      setWalletError(error.message);
    }
  };

  const loadStableCoins = async () => {
    try {
      setIsLoadingCoins(true);
      setWalletError("");
      const balances = await getStableCoinBalances();
      setStableCoins(balances);
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const handleWalletClick = () => {
    if (!wallet) {
      handleWalletConnect();
      return;
    }

    setIsWalletOpen((isOpen) => !isOpen);

    if (!stableCoins.length) {
      loadStableCoins();
    }
  };

  const handleAddStableCoin = async (coin) => {
    try {
      setWalletError("");
      await addStableCoinToWallet(coin);
    } catch (error) {
      setWalletError(error.message);
    }
  };

  const handleDemoSend = () => {
    const amountEth = 0.01;

    setDemoTransfer((current) => ({
      sentEth: Number((current.sentEth + amountEth).toFixed(4)),
      receivedEth: Number((current.receivedEth + amountEth).toFixed(4)),
      lastDirection:
        user?.role === "freelancer"
          ? "Demo receive from client"
          : "Demo send to freelancer"
    }));
  };

  const walletLabel = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Wallet";
  const defaultCounterparty =
    user?.role === "freelancer" ? defaultWalletsByRole.client : defaultWalletsByRole.freelancer;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="text-xl font-semibold tracking-tight text-white">
          FreelanceChain
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 ${isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"}`
            }
          >
            Jobs
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 ${
                    isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-slate-300">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-slate-300 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-brand-500 px-4 py-2 text-white">
                Register
              </Link>
            </>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={handleWalletClick}
              className="flex min-w-[112px] items-center justify-center gap-2 rounded-full border border-sky-500/60 bg-sky-500/10 px-4 py-2 font-medium text-sky-300 hover:border-sky-400 hover:bg-sky-500/20 hover:text-sky-100"
              title={walletError || (wallet ? `Connected wallet ${wallet}` : "Connect wallet")}
              aria-label={wallet ? `Connected wallet ${wallet}` : "Connect wallet"}
              aria-expanded={isWalletOpen}
            >
              <WalletIcon />
              <span>{walletLabel}</span>
            </button>
            {isWalletOpen ? (
              <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-left shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Crypto wallet</p>
                    <p className="mt-1 text-sm font-medium text-white">{walletLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadStableCoins}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {isLoadingCoins ? (
                    <p className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-slate-300">
                      Loading stable coins...
                    </p>
                  ) : (
                    stableCoins.map((coin) => (
                      <div
                        key={coin.symbol}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                          <p className="text-xs text-slate-400">
                            {coin.isSupportedOnChain
                              ? `${Number(coin.balance).toLocaleString(undefined, {
                                  maximumFractionDigits: 4
                                })} ${coin.symbol}`
                              : "Configure token for this network"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStableCoin(coin)}
                          disabled={!coin.isSupportedOnChain}
                          className="rounded-full border border-sky-500/50 px-3 py-1 text-xs font-medium text-sky-200 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Demo sent</p>
                      <p className="mt-1 font-semibold text-white">{demoTransfer.sentEth.toFixed(4)} ETH</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Demo received</p>
                      <p className="mt-1 font-semibold text-white">{demoTransfer.receivedEth.toFixed(4)} ETH</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDemoSend}
                    className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    False Send 0.01 ETH
                  </button>
                  <p className="mt-2 break-all text-xs text-slate-400">
                    {demoTransfer.lastDirection || "No demo transfer yet"}. Counterparty: {defaultCounterparty}
                  </p>
                  <p className="mt-1 text-xs text-emerald-200">
                    Display only. No wallet balance is changed.
                  </p>
                </div>

                {walletError ? (
                  <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-950/80 px-3 py-2 text-xs text-rose-100">
                    {walletError}
                  </p>
                ) : null}
              </div>
            ) : walletError ? (
              <span className="absolute right-0 top-full mt-2 hidden w-64 rounded-lg border border-rose-500/30 bg-rose-950 px-3 py-2 text-xs text-rose-100 shadow-lg md:block">
                {walletError}
              </span>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
