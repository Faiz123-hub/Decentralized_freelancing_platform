import { useEffect, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const emptyJobForm = {
  title: "",
  description: "",
  budget: "",
  skills: ""
};

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [applicationDrafts, setApplicationDrafts] = useState({});

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
      await api.post("/jobs", {
        ...jobForm,
        budget: Number(jobForm.budget),
        skills: jobForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      });
      setJobForm(emptyJobForm);
      setSuccess("Job posted successfully");
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
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-400"
                placeholder="Skills, comma separated"
                value={jobForm.skills}
                onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })}
              />
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
        <section className="grid gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              action={
                user?.role === "freelancer" && job.status === "open" ? (
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
                    <button
                      type="button"
                      onClick={() => handleApply(job._id)}
                      className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950"
                      disabled={submitting}
                    >
                      Apply
                    </button>
                  </div>
                ) : null
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default JobsPage;

