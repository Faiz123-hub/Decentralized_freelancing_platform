import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";

const contractAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const expectedChainId = import.meta.env.VITE_CHAIN_ID;

const statusLabels = ["created", "funded", "completed", "released"];

const contractAbi = [
  "function createJob(address freelancer) returns (uint256)",
  "function depositFunds(uint256 jobId) payable",
  "function markCompleted(uint256 jobId)",
  "function releasePayment(uint256 jobId)",
  "function jobCount() view returns (uint256)",
  "function getJob(uint256 jobId) view returns (address client, address freelancer, uint256 amount, uint8 status)"
];

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();
  if (expectedChainId && Number(network.chainId) !== Number(expectedChainId)) {
    throw new Error(`Please switch MetaMask to chain ID ${expectedChainId}`);
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
};

export const getEscrowContract = async () => {
  if (!contractAddress) {
    throw new Error("Escrow contract address missing from environment variables");
  }

  const { signer } = await connectWallet();
  return new Contract(contractAddress, contractAbi, signer);
};

export const createEscrowJob = async ({ freelancerAddress }) => {
  const contract = await getEscrowContract();
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
  const contract = await getEscrowContract();
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
  const contract = await getEscrowContract();
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
  const contract = await getEscrowContract();
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
  const contract = await getEscrowContract();
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
