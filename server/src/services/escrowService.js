import { Contract, JsonRpcProvider, formatEther } from "ethers";

export const ESCROW_STATUS_LABELS = ["created", "funded", "completed", "released"];

const escrowAbi = [
  "function getJob(uint256 jobId) view returns (address client, address freelancer, uint256 amount, uint8 status)"
];

const getProvider = () => {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;

  if (!rpcUrl) {
    throw new Error("BLOCKCHAIN_RPC_URL is not configured");
  }

  return new JsonRpcProvider(rpcUrl);
};

const getContractAddress = (addressOverride = "") => {
  const contractAddress = addressOverride || process.env.ESCROW_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("ESCROW_CONTRACT_ADDRESS is not configured");
  }

  return contractAddress;
};

export const getEscrowStatusLabel = (status) =>
  ESCROW_STATUS_LABELS[Number(status)] || "unknown";

export const getTransactionReceipt = async (txHash) => {
  if (!txHash) {
    const error = new Error("Transaction hash is required");
    error.statusCode = 400;
    throw error;
  }

  return getProvider().getTransactionReceipt(txHash);
};

export const verifyTransactionSuccess = async (txHash) => {
  const receipt = await getTransactionReceipt(txHash);

  if (!receipt) {
    const error = new Error("Transaction receipt not found yet");
    error.statusCode = 400;
    throw error;
  }

  if (receipt.status !== 1) {
    const error = new Error("Blockchain transaction failed");
    error.statusCode = 400;
    throw error;
  }

  return receipt;
};

export const fetchOnChainEscrowStatus = async (onChainJobId, addressOverride = "") => {
  const contractAddress = getContractAddress(addressOverride);
  const contract = new Contract(contractAddress, escrowAbi, getProvider());
  const [client, freelancer, amount, status] = await contract.getJob(onChainJobId);

  return {
    onChainJobId: Number(onChainJobId),
    contractAddress,
    client,
    freelancer,
    amountWei: amount.toString(),
    amountEth: formatEther(amount),
    statusCode: Number(status),
    status: getEscrowStatusLabel(status)
  };
};
