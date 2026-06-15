import { useEffect, useMemo, useState } from "react";
import JobChat from "../components/JobChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import WalletConnect from "../components/WalletConnect.jsx";
import api from "../services/api.js";
import { createEscrowJob, depositFunds, releasePayment } from "../services/blockchain.js";
import { defaultWalletsByRole } from "../utils/defaultWallets.js";
import { formatCurrency, formatDate } from "../utils/format.js";

const formatStatus = (value = "") => value.replaceAll("_", " ");
const categoryLabels = {
  web_dev: "Web Dev",
  design: "Design",
  writing: "Writing",
  app_dev: "App Dev",
  marketing: "Marketing",
  other: "Other"
};
const availabilityLabels = {
  active: "Active",
  taken: "Already taken"
};

function CompletionRateBadge({ label, stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-sky-300">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-semibold text-white">{stats.completionRate || 0}%</span>
        <span className="pb-1 text-xs text-slate-400">
          {stats.completedOrders || 0}/{stats.acceptedOrders || 0} completed
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-sky-400" style={{ width: `${stats.completionRate || 0}%` }} />
      </div>
    </div>
  );
}

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

  const handleReject = async (jobId, applicationId) => {
    try {
      setError("");
      setMessage("");
      await api.post(`/jobs/${jobId}/reject`, { applicationId });
      setMessage("Application rejected successfully");
      await loadDashboard();
    } catch (rejectError) {
      setError(rejectError.response?.data?.message || "Unable to reject application");
    }
  };

  const handleFund = async (job) => {
    try {
      setError("");
      setMessage("");
      setTxState(job._id, { action: "fund", status: "loading", message: "Creating and funding escrow..." });

      const freelancerWalletAddress = job.hiredFreelancer?.walletAddress || defaultWalletsByRole.freelancer;

      if (!freelancerWalletAddress) {
        throw new Error("The accepted freelancer must have a saved wallet address");
      }

      let escrowCreation = null;
      let onChainJobId = job.escrow?.onChainJobId;

      if (!onChainJobId) {
        escrowCreation = await createEscrowJob({
          freelancerAddress: freelancerWalletAddress
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
        depositTxHash: depositResult.depositTxHash,
        amountWei: depositResult.amountWei
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

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-400">Client workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Ongoing Projects</h2>
          </div>
          <p className="text-sm text-slate-400">{data?.ongoingProjects?.length || 0} project(s) in progress</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {data?.ongoingProjects?.length ? (
            data.ongoingProjects.map((project) => (
              <article key={project._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{project.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {project.progressPercentage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                  <span>Assigned to: {project.assignedTo?.name || "Not assigned"}</span>
                  <span>Budget: {formatCurrency(project.budget)}</span>
                  <span>Status: {formatStatus(project.status)}</span>
                  <span>Escrow: {formatStatus(project.escrowStatus)}</span>
                  <span>Started: {formatDate(project.startedAt)}</span>
                  <span>Updated: {formatDate(project.updatedAt)}</span>
                </div>

                <div className="mt-4">
                  <CompletionRateBadge
                    label="Freelancer completion rate"
                    stats={project.assignedToCompletionStats}
                  />
                </div>

                {project.assignedTo?.email ? (
                  <p className="mt-3 text-sm text-slate-500">{project.assignedTo.email}</p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-400">
              No ongoing projects yet. Accepted and funded jobs will appear here.
            </p>
          )}
        </div>
      </section>

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
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                  {job.jobCode ? (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                      Job ID: {job.jobCode}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-slate-300">{job.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                  <span>Job status: {formatStatus(job.status)}</span>
                  <span>Category: {categoryLabels[job.category] || "Other"}</span>
                  <span>Availability: {availabilityLabels[job.availabilityStatus] || "Active"}</span>
                  <span>Escrow status: {formatStatus(job.escrowStatus)}</span>
                  <span>On-chain: {formatStatus(job.escrow?.onChainStatus || "created")}</span>
                  <span>Budget: {formatCurrency(job.budget)}</span>
                </div>
                {job.projectFile?.dataUrl ? (
                  <a
                    href={job.projectFile.dataUrl}
                    download={job.projectFile.name || "project-file"}
                    className="mt-4 inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
                  >
                    Download project file
                  </a>
                ) : null}
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

            {job.hiredFreelancer && job.status !== "open" ? (
              <>
                <div className="mt-4 max-w-md">
                  <CompletionRateBadge
                    label="Freelancer completion rate"
                    stats={job.freelancerCompletionStats}
                  />
                </div>
                <JobChat jobId={job._id} title={`Chat with ${job.hiredFreelancer.name || "freelancer"}`} />
              </>
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
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(job._id, application._id)}
                            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(job._id, application._id)}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
                          >
                            Reject
                          </button>
                        </div>
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
