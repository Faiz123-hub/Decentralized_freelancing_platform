import { formatCurrency, formatDate } from "../utils/format.js";

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

function JobCard({ job, action, className = "", stacked = false }) {
  const escrowStatus = job.escrowStatus || job.escrow?.status || "created";
  const onChainStatus = job.escrow?.onChainStatus || "created";
  const formatStatus = (value) => value.replaceAll("_", " ");
  const availabilityStatus = job.availabilityStatus || "active";

  return (
    <article
      className={`rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-panel transition duration-200 hover:-translate-y-1 hover:border-brand-400 hover:bg-slate-900 hover:shadow-[0_24px_70px_rgba(61,115,246,0.18)] ${className}`}
    >
      <div
        className={`flex flex-col gap-4 ${
          stacked ? "" : "md:flex-row md:items-start md:justify-between"
        }`}
      >
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-white">{job.title}</h3>
              {job.jobCode ? (
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                  Job ID: {job.jobCode}
                </span>
              ) : null}
            </div>
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
            <span>Category: {categoryLabels[job.category] || "Other"}</span>
            <span
              className={
                availabilityStatus === "taken" ? "font-medium text-rose-300" : "font-medium text-emerald-300"
              }
            >
              Availability: {availabilityLabels[availabilityStatus] || formatStatus(availabilityStatus)}
            </span>
            <span>Status: {formatStatus(job.status)}</span>
            <span>Escrow: {formatStatus(escrowStatus)}</span>
            <span>On-chain: {formatStatus(onChainStatus)}</span>
            <span>Posted: {formatDate(job.createdAt)}</span>
          </div>

          {job.projectFile?.dataUrl ? (
            <a
              href={job.projectFile.dataUrl}
              download={job.projectFile.name || "project-file"}
              className="inline-flex rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
            >
              Download project file
            </a>
          ) : null}

          {job.escrow?.onChainJobId ? (
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs text-sky-200">
              On-chain Job ID: {job.escrow.onChainJobId}
            </div>
          ) : null}
        </div>

        {action ? <div className={stacked ? "" : "md:w-64"}>{action}</div> : null}
      </div>
    </article>
  );
}

export default JobCard;
