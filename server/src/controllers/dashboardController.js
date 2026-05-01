import Application from "../models/Application.js";
import Job from "../models/Job.js";

export const getClientDashboard = async (req, res, next) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate("hiredFreelancer", "name email walletAddress")
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("freelancer", "name email walletAddress skills")
      .populate("job", "title budget status");

    res.json({
      metrics: {
        jobsPosted: jobs.length,
        activeJobs: jobs.filter((job) => job.status !== "paid").length,
        paymentsReleased: jobs.filter((job) => job.status === "paid").length
      },
      jobs,
      applications
    });
  } catch (error) {
    next(error);
  }
};

export const getFreelancerDashboard = async (req, res, next) => {
  try {
    const applications = await Application.find({ freelancer: req.user._id })
      .populate({
        path: "job",
        populate: {
          path: "client",
          select: "name email walletAddress"
        }
      })
      .sort({ createdAt: -1 });

    const activeJobs = await Job.find({ hiredFreelancer: req.user._id })
      .populate("client", "name email walletAddress")
      .sort({ updatedAt: -1 });

    res.json({
      metrics: {
        applicationsSent: applications.length,
        activeJobs: activeJobs.filter((job) => job.status !== "paid").length,
        completedJobs: activeJobs.filter((job) => job.status === "paid").length
      },
      applications,
      activeJobs
    });
  } catch (error) {
    next(error);
  }
};

