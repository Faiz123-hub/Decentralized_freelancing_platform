import { BrowserProvider, Contract, formatEther, formatUnits, parseEther } from "ethers";

const configuredContractAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const expectedChainId = import.meta.env.VITE_CHAIN_ID;
const useRealEscrowTransactions = import.meta.env.VITE_REAL_ESCROW_TX === "true";
const localHardhatEscrowAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const localHardhatNetwork = {
  chainId: "0x7a69",
  chainName: "Hardhat Localhost",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["http://127.0.0.1:8545"],
  blockExplorerUrls: []
};

const statusLabels = ["created", "funded", "completed", "released"];

const contractAbi = [
  "function createJob(address freelancer) returns (uint256)",
  "function depositFunds(uint256 jobId) payable",
  "function markCompleted(uint256 jobId)",
  "function releasePayment(uint256 jobId)",
  "function jobCount() view returns (uint256)",
  "function getJob(uint256 jobId) view returns (address client, address freelancer, uint256 amount, uint8 status)"
];

const erc20Abi = ["function balanceOf(address account) view returns (uint256)"];

const isConfiguredContractAddress = (address) =>
  address && !address.includes("YourDeployed") && address !== "0x0000000000000000000000000000000000000000";

const getEscrowContractAddress = (chainId) => {
  if (isConfiguredContractAddress(configuredContractAddress)) {
    return configuredContractAddress;
  }

  if (Number(chainId) === 31337) {
    return localHardhatEscrowAddress;
  }

  throw new Error("Escrow contract address missing from environment variables");
};

const normalizeWalletError = (error) => {
  const message = error?.info?.error?.message || error?.error?.message || error?.message || "";

  if (message.includes("RPC endpoint returned too many errors") || message.includes("eth_blockNumber")) {
    return new Error(
      "MetaMask RPC is not responding. Start Hardhat with `npx hardhat node`, then switch MetaMask to Hardhat Localhost (chain ID 31337, RPC http://127.0.0.1:8545)."
    );
  }

  return error;
};

const buildDemoTxHash = (action) => `demo-${action}-${Date.now().toString(36)}`;

const getDemoOnChainJobId = () => Number(`${Date.now()}`.slice(-8));

export const supportedStableCoins = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    }
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    addresses: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    }
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    addresses: {
      1: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    }
  }
];

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    let provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    let network = await provider.getNetwork();
    if (expectedChainId && Number(network.chainId) !== Number(expectedChainId)) {
      const expectedChainHex = `0x${Number(expectedChainId).toString(16)}`;

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: expectedChainHex }]
        });
      } catch (switchError) {
        if (Number(expectedChainId) === 31337 && switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [localHardhatNetwork]
          });
        } else {
          throw new Error(`Please switch MetaMask to chain ID ${expectedChainId}`);
        }
      }

      provider = new BrowserProvider(window.ethereum);
      network = await provider.getNetwork();
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address, chainId: Number(network.chainId) };
  } catch (error) {
    throw normalizeWalletError(error);
  }
};

export const getStableCoinBalances = async () => {
  const { provider, address, chainId } = await connectWallet();

  return Promise.all(
    supportedStableCoins.map(async (coin) => {
      const tokenAddress = coin.addresses[chainId];

      if (!tokenAddress) {
        return {
          ...coin,
          tokenAddress: "",
          balance: null,
          isSupportedOnChain: false
        };
      }

      const token = new Contract(tokenAddress, erc20Abi, provider);
      const balance = await token.balanceOf(address);

      return {
        ...coin,
        tokenAddress,
        balance: formatUnits(balance, coin.decimals),
        isSupportedOnChain: true
      };
    })
  );
};

export const addStableCoinToWallet = async (coin) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  if (!coin.tokenAddress) {
    throw new Error(`${coin.symbol} is not configured for this network`);
  }

  return window.ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: coin.tokenAddress,
        symbol: coin.symbol,
        decimals: coin.decimals
      }
    }
  });
};

export const getEscrowContract = async () => {
  const { signer, chainId } = await connectWallet();
  const contractAddress = getEscrowContractAddress(chainId);

  return {
    contract: new Contract(contractAddress, contractAbi, signer),
    contractAddress
  };
};

export const createEscrowJob = async ({ freelancerAddress }) => {
  if (!useRealEscrowTransactions) {
    return {
      onChainJobId: getDemoOnChainJobId(),
      contractAddress: "demo-escrow",
      createTxHash: buildDemoTxHash("create"),
      freelancerAddress
    };
  }

  const { contract, contractAddress } = await getEscrowContract();
  const tx = await contract.createJob(freelancerAddress);
  const receipt = await tx.wait();
  const onChainJobId = await contract.jobCount();

  return {
    onChainJobId: Number(onChainJobId),
    contractAddress,
    createTxHash: receipt.hash
  };
};

export const depositFunds = async ({ onChainJobId, amountEth }) => {
  if (!useRealEscrowTransactions) {
    return {
      contractAddress: "demo-escrow",
      onChainJobId,
      depositTxHash: buildDemoTxHash("deposit"),
      amountWei: parseEther(String(amountEth)).toString(),
      status: "funded"
    };
  }

  const { contract, contractAddress } = await getEscrowContract();
  const tx = await contract.depositFunds(onChainJobId, {
    value: parseEther(String(amountEth))
  });
  const receipt = await tx.wait();
  const escrowJob = await contract.getJob(onChainJobId);

  return {
    contractAddress,
    onChainJobId,
    depositTxHash: receipt.hash,
    amountWei: escrowJob.amount.toString(),
    status: statusLabels[Number(escrowJob.status)] || "funded"
  };
};

export const markEscrowJobCompleted = async (onChainJobId) => {
  if (!useRealEscrowTransactions) {
    return {
      contractAddress: "demo-escrow",
      onChainJobId,
      completeTxHash: buildDemoTxHash("complete"),
      status: "completed"
    };
  }

  const { contract, contractAddress } = await getEscrowContract();
  const tx = await contract.markCompleted(onChainJobId);
  const receipt = await tx.wait();

  return {
    contractAddress,
    onChainJobId,
    completeTxHash: receipt.hash,
    status: "completed"
  };
};

export const releasePayment = async (onChainJobId) => {
  if (!useRealEscrowTransactions) {
    return {
      contractAddress: "demo-escrow",
      onChainJobId,
      releaseTxHash: buildDemoTxHash("release"),
      status: "released"
    };
  }

  const { contract, contractAddress } = await getEscrowContract();
  const tx = await contract.releasePayment(onChainJobId);
  const receipt = await tx.wait();

  return {
    contractAddress,
    onChainJobId,
    releaseTxHash: receipt.hash,
    status: "released"
  };
};

export const getEscrowJob = async (onChainJobId) => {
  const { contract } = await getEscrowContract();
  const job = await contract.getJob(onChainJobId);

  return {
    client: job.client,
    freelancer: job.freelancer,
    amountWei: job.amount.toString(),
    amountEth: formatEther(job.amount),
    statusCode: Number(job.status),
    status: statusLabels[Number(job.status)] || "unknown"
  };
};

export { formatEther };
