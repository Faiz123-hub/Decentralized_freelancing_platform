import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import WalletConnect from "../components/WalletConnect.jsx";
import api from "../services/api.js";
import { createEscrowJob, depositFunds, releasePayment } from "../services/blockchain.js";
import { formatCurrency } from "../utils/format.js";

const formatStatus = (value = "") => value.replaceAll("_", " ");

function ClientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState("");
  const [txStates, setTxStates] = useState({});

  const groupedApplications = useMemo(() => {
    const entries = {};
    (data?.applications || []).forEach((application) => {
      const key = application.job?._id || application.job;
      entries[key] = entries[key] || [];
      entries[key].push(application);
    });
    return entries;
  }, [data]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/client");
      setData(response.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const setTxState = (jobId, nextState) => {
    setTxStates((current) => ({
      ...current,
      [jobId]: nextState
    }));
  };

  const estimateEscrowAmountEth = (budget) => (Number(budget) / 3000).toFixed(4);

  const handleAccept = async (jobId, applicationId) => {
    try {
      setError("");
      setMessage("");
      await api.post(`/jobs/${jobId}/accept`, { applicationId });
      setMessage("Application accepted successfully");
      await loadDashboard();
    } catch (acceptError) {
      setError(acceptError.response?.data?.message || "Unable to accept application");
    }
  };

  const handleFund = async (job) => {
    try {
      setError("");
      setMessage("");
      setTxState(job._id, { action: "fund", status: "loading", message: "Creating and funding escrow..." });

      if (!job.hiredFreelancer?.walletAddress) {
        throw new Error("The accepted freelancer must have a saved wallet address");
      }

      let escrowCreation = null;
      let onChainJobId = job.escrow?.onChainJobId;

      if (!onChainJobId) {
        escrowCreation = await createEscrowJob({
          freelancerAddress: job.hiredFreelancer.walletAddress
        });
        onChainJobId = escrowCreation.onChainJobId;
      }

      const depositResult = await depositFunds({
        onChainJobId,
        amountEth: estimateEscrowAmountEth(job.budget)
      });

      await api.post(`/jobs/${job._id}/fund`, {
        onChainJobId,
        contractAddress: depositResult.contractAddress,
        createTxHash: escrowCreation?.createTxHash || job.escrow?.createTxHash || "",
        depositTxHash: depositResult.depositTxHash
      });

      setMessage("Escrow funded successfully");
      setTxState(job._id, { action: "fund", status: "success", message: "Escrow funded." });
      await loadDashboard();
    } catch (fundError) {
      const messageText = fundError.response?.data?.message || fundError.message || "Unable to fund escrow";
      setError(messageText);
      setTxState(job._id, { action: "fund", status: "error", message: messageText });
    }
  };

  const handleRelease = async (job) => {
    try {
      setError("");
      setMessage("");
      setTxState(job._id, { action: "release", status: "loading", message: "Releasing payment..." });
      const result = await releasePayment(job.escrow.onChainJobId);
      await api.post(`/jobs/${job._id}/release`, result);
      setMessage("Payment released successfully");
      setTxState(job._id, { action: "release", status: "success", message: "Payment released." });
      await loadDashboard();
    } catch (releaseError) {
      const messageText =
        releaseError.response?.data?.message || releaseError.message || "Unable to release payment";
      setError(messageText);
      setTxState(job._id, { action: "release", status: "error", message: messageText });
    }
  };

  const handleRefreshEscrow = async (jobId) => {
    try {
      setTxState(jobId, { action: "refresh", status: "loading", message: "Refreshing escrow status..." });
      await api.get(`/jobs/${jobId}/escrow-status`);
      setTxState(jobId, { action: "refresh", status: "success", message: "Escrow status refreshed." });
      await loadDashboard();
    } catch (refreshError) {
      const messageText =
        refreshError.response?.data?.message || refreshError.message || "Unable to refresh escrow status";
      setError(messageText);
      setTxState(jobId, { action: "refresh", status: "error", message: messageText });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading client dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Jobs posted</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.jobsPosted || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Active jobs</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.activeJobs || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Payments released</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.paymentsReleased || 0}</p>
        </div>
      </section>

      <WalletConnect onConnected={setWallet} />
      {wallet ? <p className="text-sm text-emerald-300">Connected wallet: {wallet}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <section className="space-y-6">
        {data?.jobs.map((job) => (
          <div key={job._id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            {txStates[job._id]?.message ? (
              <p
                className={`mb-4 text-sm ${
                  txStates[job._id]?.status === "error" ? "text-rose-300" : "text-emerald-300"
                }`}
              >
                {txStates[job._id].message}
              </p>
            ) : null}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                <p className="mt-2 text-slate-300">{job.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                  <span>Job status: {formatStatus(job.status)}</span>
                  <span>Escrow status: {formatStatus(job.escrowStatus)}</span>
                  <span>On-chain: {formatStatus(job.escrow?.onChainStatus || "created")}</span>
                  <span>Budget: {formatCurrency(job.budget)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {job.status === "accepted" ? (
                  <button
                    type="button"
                    onClick={() => handleFund(job)}
                    className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white"
                  >
                    Fund Escrow
                  </button>
                ) : null}

                {job.status === "completed" && job.escrowStatus === "funded" ? (
                  <button
                    type="button"
                    onClick={() => handleRelease(job)}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950"
                  >
                    Release Payment
                  </button>
                ) : null}

                {job.escrow?.onChainJobId ? (
                  <button
                    type="button"
                    onClick={() => handleRefreshEscrow(job._id)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200"
                  >
                    Refresh Escrow
                  </button>
                ) : null}
              </div>
            </div>

            {job.escrow?.onChainJobId ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                On-chain Job ID: {job.escrow.onChainJobId}
                {job.escrow.createTxHash ? ` | Create tx: ${job.escrow.createTxHash}` : ""}
                {job.escrow.depositTxHash ? ` | Deposit tx: ${job.escrow.depositTxHash}` : ""}
                {job.escrow.releaseTxHash ? ` | Release tx: ${job.escrow.releaseTxHash}` : ""}
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-medium text-white">Applications</h3>
              {(groupedApplications[job._id] || []).length === 0 ? (
                <p className="text-sm text-slate-400">No applications yet.</p>
              ) : (
                groupedApplications[job._id].map((application) => (
                  <div key={application._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-white">{application.freelancer?.name}</p>
                        <p className="text-sm text-slate-400">{application.freelancer?.email}</p>
                        <p className="mt-3 text-sm text-slate-300">{application.coverLetter}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Proposed rate: {formatCurrency(application.proposedRate)} | Status:{" "}
                          {formatStatus(application.status)}
                        </p>
                      </div>
                      {job.status === "open" && application.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => handleAccept(job._id, application._id)}
                          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white"
                        >
                          Accept
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ClientDashboard;
