import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import WalletConnect from "../components/WalletConnect.jsx";
import api from "../services/api.js";
import { markEscrowJobCompleted } from "../services/blockchain.js";
import { formatCurrency } from "../utils/format.js";

const formatStatus = (value = "") => value.replaceAll("_", " ");

function FreelancerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [txStates, setTxStates] = useState({});

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/freelancer");
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

  const handleMarkComplete = async (job) => {
    try {
      setError("");
      setMessage("");
      setTxState(job._id, { action: "complete", status: "loading", message: "Marking work complete..." });
      const blockchainResult = await markEscrowJobCompleted(job.escrow.onChainJobId);
      await api.post(`/jobs/${job._id}/complete`, blockchainResult);
      setMessage("Work marked complete successfully");
      setTxState(job._id, { action: "complete", status: "success", message: "Job marked complete." });
      await loadDashboard();
    } catch (submitError) {
      const messageText =
        submitError.response?.data?.message || submitError.message || "Unable to mark the job complete";
      setError(messageText);
      setTxState(job._id, { action: "complete", status: "error", message: messageText });
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
    return <LoadingSpinner text="Loading freelancer dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Applications sent</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.applicationsSent || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Active jobs</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.activeJobs || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Completed jobs</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.metrics.completedJobs || 0}</p>
        </div>
      </section>

      <WalletConnect />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Applications</h2>
          <div className="mt-4 space-y-4">
            {data?.applications.length ? (
              data.applications.map((application) => (
                <div key={application._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="font-medium text-white">{application.job?.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{application.coverLetter}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    Status: {formatStatus(application.status)} | Proposed rate:{" "}
                    {formatCurrency(application.proposedRate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No applications yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Assigned Jobs</h2>
          <div className="mt-4 space-y-4">
            {data?.activeJobs.length ? (
              data.activeJobs.map((job) => (
                <div key={job._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  {txStates[job._id]?.message ? (
                    <p
                      className={`mb-3 text-sm ${
                        txStates[job._id]?.status === "error" ? "text-rose-300" : "text-emerald-300"
                      }`}
                    >
                      {txStates[job._id].message}
                    </p>
                  ) : null}
                  <h3 className="font-medium text-white">{job.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{job.description}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    Client: {job.client?.name} | Budget: {formatCurrency(job.budget)}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Job status: {formatStatus(job.status)} | Escrow status: {formatStatus(job.escrowStatus)} |
                    On-chain: {formatStatus(job.escrow?.onChainStatus || "created")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {job.status === "in_progress" && job.escrowStatus === "funded" ? (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(job)}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950"
                      >
                        Mark Complete
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
              ))
            ) : (
              <p className="text-sm text-slate-400">No assigned jobs yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default FreelancerDashboard;
