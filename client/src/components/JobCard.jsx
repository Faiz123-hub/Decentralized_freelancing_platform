import { formatCurrency, formatDate } from "../utils/format.js";

function JobCard({ job, action }) {
  const escrowStatus = job.escrowStatus || job.escrow?.status || "created";
  const onChainStatus = job.escrow?.onChainStatus || "created";
  const formatStatus = (value) => value.replaceAll("_", " ");

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{job.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{job.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.skills?.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>Budget: {formatCurrency(job.budget)}</span>
            <span>Status: {formatStatus(job.status)}</span>
            <span>Escrow: {formatStatus(escrowStatus)}</span>
            <span>On-chain: {formatStatus(onChainStatus)}</span>
            <span>Posted: {formatDate(job.createdAt)}</span>
          </div>

          {job.escrow?.onChainJobId ? (
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs text-sky-200">
              On-chain Job ID: {job.escrow.onChainJobId}
            </div>
          ) : null}
        </div>

        {action ? <div className="md:w-64">{action}</div> : null}
      </div>
    </article>
  );
}

export default JobCard;
