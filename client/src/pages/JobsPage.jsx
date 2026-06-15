import { useEffect, useMemo, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const emptyJobForm = {
  title: "",
  description: "",
  budget: "",
  category: "web_dev",
  availabilityStatus: "active",
  projectFile: null,
  skills: ""
};

const jobCategories = [
  { value: "web_dev", label: "Web Dev" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing" },
  { value: "app_dev", label: "App Dev" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" }
];

const categoryFilters = [{ value: "all", label: "All" }, ...jobCategories];

const availabilityOptions = [
  { value: "active", label: "Active" },
  { value: "taken", label: "Already taken" }
];

const maxProjectFileSize = 2 * 1024 * 1024;

const readProjectFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result
      });
    };

    reader.onerror = () => reject(new Error("Unable to read project file"));
    reader.readAsDataURL(file);
  });

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [applicationDrafts, setApplicationDrafts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rejectedJobIds, setRejectedJobIds] = useState([]);

  const visibleCategoryRows = useMemo(() => {
    const availableJobs = jobs.filter((job) => !rejectedJobIds.includes(job._id));
    const categories = selectedCategory === "all" ? jobCategories : jobCategories.filter((category) => category.value === selectedCategory);

    return categories
      .map((category) => ({
        ...category,
        jobs: availableJobs.filter((job) => (job.category || "other") === category.value)
      }))
      .filter((category) => selectedCategory !== "all" || category.jobs.length > 0);
  }, [jobs, rejectedJobIds, selectedCategory]);

  const jobCountByCategory = useMemo(() => {
    const counts = { all: jobs.length };

    jobCategories.forEach((category) => {
      counts[category.value] = jobs.filter((job) => (job.category || "other") === category.value).length;
    });

    return counts;
  }, [jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/jobs");
      setJobs(data.jobs);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      let projectFile = null;

      if (jobForm.projectFile) {
        projectFile = await readProjectFile(jobForm.projectFile);
      }

      const { data } = await api.post("/jobs", {
        ...jobForm,
        projectFile,
        budget: Number(jobForm.budget),
        skills: jobForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      });
      setJobForm(emptyJobForm);
      setFileInputKey((current) => current + 1);
      setSuccess(`Job posted successfully. Job ID: ${data.job.jobCode}`);
      loadJobs();
    } catch (createError) {
      setError(createError.response?.data?.message || "Unable to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (jobId) => {
    const draft = applicationDrafts[jobId] || { coverLetter: "", proposedRate: "" };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.post(`/jobs/${jobId}/apply`, {
        coverLetter: draft.coverLetter,
        proposedRate: Number(draft.proposedRate)
      });
      setApplicationDrafts((current) => ({
        ...current,
        [jobId]: { coverLetter: "", proposedRate: "" }
      }));
      setSuccess("Application submitted");
    } catch (applyError) {
      setError(applyError.response?.data?.message || "Unable to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectJob = (jobId) => {
    setRejectedJobIds((current) => [...new Set([...current, jobId])]);
    setSuccess("Job rejected from your browsing list");
  };

  const renderJobAction = (job) => {
    if (user?.role !== "freelancer" || job.status !== "open" || job.availabilityStatus === "taken") {
      return null;
    }

    return (
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          placeholder="Proposed rate"
          type="number"
          min="1"
          value={applicationDrafts[job._id]?.proposedRate || ""}
          onChange={(event) =>
            setApplicationDrafts((current) => ({
              ...current,
              [job._id]: {
                ...current[job._id],
                proposedRate: event.target.value
              }
            }))
          }
        />
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          placeholder="Cover letter"
          value={applicationDrafts[job._id]?.coverLetter || ""}
          onChange={(event) =>
            setApplicationDrafts((current) => ({
              ...current,
              [job._id]: {
                ...current[job._id],
                coverLetter: event.target.value
              }
            }))
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleApply(job._id)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            disabled={submitting}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleRejectJob(job._id)}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
            disabled={submitting}
          >
            Reject
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/60 p-8 shadow-panel">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Decentralized hiring</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
              Hire with trust, get paid through smart-contract escrow.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Clients manage job posts and release milestone payments on-chain. Freelancers discover work,
              apply quickly, and receive escrow-backed payouts through MetaMask.
            </p>
          </div>

          {user?.role === "client" ? (
            <form onSubmit={handleCreateJob} className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Post a new job</h2>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                placeholder="Job title"
                value={jobForm.title}
                onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })}
                required
              />
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                placeholder="Describe the scope"
                value={jobForm.description}
                onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })}
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                placeholder="Budget in USD"
                type="number"
                min="1"
                value={jobForm.budget}
                onChange={(event) => setJobForm({ ...jobForm, budget: event.target.value })}
                required
              />
              <select
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                value={jobForm.category}
                onChange={(event) => setJobForm({ ...jobForm, category: event.target.value })}
              >
                {jobCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                value={jobForm.availabilityStatus}
                onChange={(event) => setJobForm({ ...jobForm, availabilityStatus: event.target.value })}
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                placeholder="Skills, comma separated"
                value={jobForm.skills}
                onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })}
              />
              <label className="block rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                <span className="block font-medium text-white">Project file</span>
                <span className="mt-1 block text-xs text-slate-400">Optional PDF, image, or document up to 2 MB</span>
                <input
                  key={fileInputKey}
                  className="mt-3 w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    if (file && file.size > maxProjectFileSize) {
                      setError("Project file must be 2 MB or smaller");
                      event.target.value = "";
                      setJobForm({ ...jobForm, projectFile: null });
                      return;
                    }

                    setError("");
                    setJobForm({ ...jobForm, projectFile: file });
                  }}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-medium text-white disabled:opacity-70"
                disabled={submitting}
              >
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Browse open opportunities</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Apply to projects that match your skills. Once selected, payment can be escrowed on-chain and
                released when you submit the finished work.
              </p>
            </div>
          )}
        </div>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

      {loading ? (
        <LoadingSpinner text="Fetching jobs..." />
      ) : (
        <section className="space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categoryFilters.map((category) => {
              const isSelected = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`aspect-square rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-500/10 ${
                    isSelected
                      ? "border-brand-400 bg-brand-500/20 text-white"
                      : "border-slate-800 bg-slate-900/70 text-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold">{category.label}</span>
                  <span className="mt-2 block text-2xl font-semibold text-white">
                    {jobCountByCategory[category.value] || 0}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">Jobs</span>
                </button>
              );
            })}
          </div>

          {visibleCategoryRows.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
              No jobs found in this category.
            </div>
          ) : (
            visibleCategoryRows.map((category) => (
              <div key={category.value} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">{category.label}</h2>
                  <span className="text-sm text-slate-400">{category.jobs.length} jobs</span>
                </div>
                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
                  {category.jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      action={renderJobAction(job)}
                      stacked
                      className="min-h-[520px] w-[320px] shrink-0 sm:w-[360px]"
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default JobsPage;
