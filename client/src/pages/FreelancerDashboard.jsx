import { useEffect, useMemo, useState } from "react";
import JobChat from "../components/JobChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import WalletConnect from "../components/WalletConnect.jsx";
import api from "../services/api.js";
import { markEscrowJobCompleted } from "../services/blockchain.js";
import { formatCurrency, formatDate } from "../utils/format.js";

const formatStatus = (value = "") => value.replaceAll("_", " ");

const demoEarningAmounts = [
  120,
  180,
  160,
  260,
  240,
  420,
  360,
  510,
  460,
  620,
  580,
  760,
  690,
  880,
  820,
  1040,
  960,
  1180,
  1090,
  1320,
  1260,
  1480,
  1410,
  1660,
  1580,
  1810,
  1730,
  1960,
  1880,
  2140
];

const demoEarningTrend = demoEarningAmounts.map((earnings, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (29 - index));

  return {
    date: date.toISOString().slice(0, 10),
    earnings
  };
});

function CompletionRateBadge({ label, stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
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

function EarningTrendChart({ trend = [] }) {
  const hasRealEarnings = trend.some((point) => Number(point.earnings || 0) > 0);
  const chartTrend = hasRealEarnings ? trend : demoEarningTrend;

  const chart = useMemo(() => {
    const values = chartTrend.map((point) => Number(point.earnings || 0));
    const max = Math.max(...values, 1);
    const width = 720;
    const height = 220;
    const padding = 28;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const points = chartTrend.map((point, index) => {
      const x = padding + (chartTrend.length > 1 ? (index / (chartTrend.length - 1)) * innerWidth : 0);
      const y = padding + innerHeight - (Number(point.earnings || 0) / max) * innerHeight;
      return { ...point, x, y };
    });
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
    const areaPath = points.length
      ? `${path} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`
      : "";

    return { areaPath, height, max, path, points, width };
  }, [chartTrend]);

  if (!chartTrend.length) {
    return <p className="mt-4 text-sm text-slate-400">No earning trend data yet.</p>;
  }

  const firstDate = chartTrend[0]?.date;
  const lastDate = chartTrend[chartTrend.length - 1]?.date;
  const totalShown = chartTrend.reduce((sum, point) => sum + Number(point.earnings || 0), 0);
  const bestDay = chartTrend.reduce((best, point) =>
    Number(point.earnings || 0) > Number(best.earnings || 0) ? point : best
  );

  return (
    <div className="mt-5">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">30 day view</p>
          <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totalShown)}</p>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Best day</p>
          <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(bestDay.earnings)}</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Data mode</p>
          <p className="mt-2 text-xl font-semibold text-white">{hasRealEarnings ? "Live" : "Demo"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-panel">
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-64 w-full" role="img">
          <defs>
            <linearGradient id="earningTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.34" />
              <stop offset="52%" stopColor="#34d399" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="earningTrendStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="earningTrendGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="28"
              x2="692"
              y1={28 + (192 - 28) * ratio}
              y2={28 + (192 - 28) * ratio}
              stroke="#1e293b"
              strokeDasharray="6 8"
              strokeWidth="1"
            />
          ))}
          <line x1="28" x2="692" y1="192" y2="192" stroke="#334155" strokeWidth="1" />
          <line x1="28" x2="28" y1="28" y2="192" stroke="#334155" strokeWidth="1" />
          {chart.areaPath ? <path d={chart.areaPath} fill="url(#earningTrendFill)" /> : null}
          {chart.path ? (
            <path
              d={chart.path}
              fill="none"
              filter="url(#earningTrendGlow)"
              stroke="url(#earningTrendStroke)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ) : null}
          {chart.points.map((point) => (
            <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2">
              <title>
                {formatDate(point.date)}: {formatCurrency(point.earnings)}
              </title>
            </circle>
          ))}
          <text x="34" y="22" fill="#94a3b8" fontSize="13">
            {formatCurrency(chart.max)}
          </text>
          <text x="34" y="214" fill="#94a3b8" fontSize="13">
            {formatCurrency(0)}
          </text>
        </svg>
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{formatDate(firstDate)}</span>
        <span>{formatDate(lastDate)}</span>
      </div>
    </div>
  );
}

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

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-400">Freelancer history</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Past Work Summary</h2>
          </div>
          <p className="text-sm text-slate-400">Last 30 days earning trend</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Total earnings</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatCurrency(data?.history?.totalEarnings || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Completed jobs</p>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.history?.completedJobs || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Pending jobs</p>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.history?.pendingJobs || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Active for</p>
            <p className="mt-3 text-2xl font-semibold text-white">{data?.history?.activeDays || 0} days</p>
          </div>
        </div>

        <EarningTrendChart trend={data?.history?.earningTrend || []} />
      </section>

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
                  {job.status !== "open" ? (
                    <CompletionRateBadge label="Client completion rate" stats={job.clientCompletionStats} />
                  ) : null}
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
                  {job.status !== "open" ? (
                    <JobChat jobId={job._id} title={`Chat with ${job.client?.name || "client"}`} />
                  ) : null}
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
