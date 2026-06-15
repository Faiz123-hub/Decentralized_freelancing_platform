import Application from "../models/Application.js";
import Job from "../models/Job.js";

const progressByStatus = {
  open: 0,
  accepted: 25,
  in_progress: 60,
  completed: 90,
  paid: 100
};

const getProjectProgress = (job) => {
  if (job.status === "paid" || job.escrowStatus === "released") {
    return 100;
  }

  if (job.status === "completed") {
    return 90;
  }

  if (job.status === "in_progress" && job.escrowStatus === "funded") {
    return 65;
  }

  return progressByStatus[job.status] ?? 0;
};

const getLastThirtyDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    return date;
  });
};

const buildCompletionStats = async ({ role, userIds }) => {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map((id) => String(id)))];

  if (!uniqueIds.length) {
    return {};
  }

  const query =
    role === "client"
      ? { client: { $in: uniqueIds }, hiredFreelancer: { $ne: null }, status: { $ne: "open" } }
      : { hiredFreelancer: { $in: uniqueIds }, status: { $ne: "open" } };
  const jobs = await Job.find(query).select("client hiredFreelancer status");

  return jobs.reduce((stats, job) => {
    const userId = String(role === "client" ? job.client : job.hiredFreelancer);
    const current = stats[userId] || {
      acceptedOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      completionRate: 0
    };

    current.acceptedOrders += 1;

    if (job.status === "paid") {
      current.completedOrders += 1;
    } else {
      current.pendingOrders += 1;
    }

    current.completionRate = Math.round((current.completedOrders / current.acceptedOrders) * 100);
    stats[userId] = current;

    return stats;
  }, {});
};

export const getClientDashboard = async (req, res, next) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate("hiredFreelancer", "name email walletAddress")
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("freelancer", "name email walletAddress skills")
      .populate("job", "title budget status");

    const freelancerStats = await buildCompletionStats({
      role: "freelancer",
      userIds: jobs.map((job) => job.hiredFreelancer?._id)
    });
    const jobsWithCompletionRates = jobs.map((job) => {
      const plainJob = job.toObject();
      const freelancerId = plainJob.hiredFreelancer?._id;

      if (freelancerId) {
        plainJob.freelancerCompletionStats = freelancerStats[String(freelancerId)] || {
          acceptedOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          completionRate: 0
        };
      }

      return plainJob;
    });

    const ongoingProjects = jobs
      .filter((job) => job.hiredFreelancer && job.status !== "open" && job.status !== "paid")
      .map((job) => ({
        _id: job._id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        status: job.status,
        escrowStatus: job.escrowStatus,
        progressPercentage: getProjectProgress(job),
        assignedTo: job.hiredFreelancer,
        assignedToCompletionStats: freelancerStats[String(job.hiredFreelancer?._id)] || {
          acceptedOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          completionRate: 0
        },
        startedAt: job.escrow?.fundedAt || job.updatedAt,
        updatedAt: job.updatedAt
      }));

    res.json({
      metrics: {
        jobsPosted: jobs.length,
        activeJobs: jobs.filter((job) => job.status !== "paid").length,
        paymentsReleased: jobs.filter((job) => job.status === "paid").length
      },
      ongoingProjects,
      jobs: jobsWithCompletionRates,
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
    const clientStats = await buildCompletionStats({
      role: "client",
      userIds: activeJobs.map((job) => job.client?._id)
    });
    const activeJobsWithCompletionRates = activeJobs.map((job) => {
      const plainJob = job.toObject();
      const clientId = plainJob.client?._id;

      if (clientId) {
        plainJob.clientCompletionStats = clientStats[String(clientId)] || {
          acceptedOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          completionRate: 0
        };
      }

      return plainJob;
    });

    const completedJobs = activeJobs.filter((job) => job.status === "paid");
    const pendingJobs = activeJobs.filter((job) => job.status !== "paid");
    const totalEarnings = completedJobs.reduce((sum, job) => sum + Number(job.budget || 0), 0);
    const activeSince = req.user.createdAt ? new Date(req.user.createdAt) : new Date();
    const activeDays = Math.max(1, Math.ceil((Date.now() - activeSince.getTime()) / (1000 * 60 * 60 * 24)));
    const earningsByDate = completedJobs.reduce((entries, job) => {
      const earnedAt = job.escrow?.releasedAt || job.updatedAt || job.createdAt;
      const key = new Date(earnedAt).toISOString().slice(0, 10);
      entries[key] = (entries[key] || 0) + Number(job.budget || 0);
      return entries;
    }, {});
    const earningTrend = getLastThirtyDays().map((date) => {
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        earnings: earningsByDate[key] || 0
      };
    });

    res.json({
      metrics: {
        applicationsSent: applications.length,
        activeJobs: pendingJobs.length,
        completedJobs: completedJobs.length
      },
      history: {
        totalEarnings,
        completedJobs: completedJobs.length,
        pendingJobs: pendingJobs.length,
        activeDays,
        earningTrend
      },
      applications,
      activeJobs: activeJobsWithCompletionRates
    });
  } catch (error) {
    next(error);
  }
};
