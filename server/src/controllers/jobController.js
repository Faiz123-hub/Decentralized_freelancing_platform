import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { fetchOnChainEscrowStatus, verifyTransactionSuccess } from "../services/escrowService.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toEscrowObject = (job) => ({
  onChainJobId: job.escrow?.onChainJobId ?? null,
  contractAddress: job.escrow?.contractAddress || "",
  status: job.escrow?.status || job.escrowStatus || "created",
  onChainStatus: job.escrow?.onChainStatus || "created",
  createTxHash: job.escrow?.createTxHash || "",
  depositTxHash: job.escrow?.depositTxHash || "",
  completeTxHash: job.escrow?.completeTxHash || "",
  releaseTxHash: job.escrow?.releaseTxHash || "",
  amountWei: job.escrow?.amountWei || "0",
  fundedAt: job.escrow?.fundedAt || null,
  completedAt: job.escrow?.completedAt || null,
  releasedAt: job.escrow?.releasedAt || null
});

const ensureJob = async (jobId) => {
  const job = await Job.findById(jobId).populate("hiredFreelancer", "walletAddress name email");

  if (!job) {
    throw createHttpError("Job not found", 404);
  }

  return job;
};

const ensureClientOwnership = (job, userId) => {
  if (String(job.client) !== String(userId)) {
    throw createHttpError("Only the job owner can perform this action", 403);
  }
};

const ensureAssignedFreelancer = (job, userId) => {
  const freelancerId = job.hiredFreelancer?._id || job.hiredFreelancer;

  if (!freelancerId || String(freelancerId) !== String(userId)) {
    throw createHttpError("Only the assigned freelancer can perform this action", 403);
  }
};

const syncEscrowSnapshot = ({ job, onChain, txUpdates = {}, timestampField = "" }) => {
  const escrow = toEscrowObject(job);

  job.escrowStatus =
    onChain.status === "released"
      ? "released"
      : onChain.status === "funded" || onChain.status === "completed"
        ? "funded"
        : "created";

  job.escrow = {
    ...escrow,
    contractAddress: onChain.contractAddress,
    onChainJobId: onChain.onChainJobId,
    amountWei: onChain.amountWei,
    status: job.escrowStatus,
    onChainStatus: onChain.status,
    ...txUpdates
  };

  if (timestampField) {
    job.escrow[timestampField] = new Date();
  }
};

export const getJobs = async (_req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("client", "name email walletAddress")
      .populate("hiredFreelancer", "name email walletAddress")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("client", "name email walletAddress")
      .populate("hiredFreelancer", "name email walletAddress");

    if (!job) {
      throw createHttpError("Job not found", 404);
    }

    const applications = await Application.find({ job: job._id }).populate(
      "freelancer",
      "name email walletAddress skills"
    );

    res.json({ job, applications });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const { title, description, budget, skills } = req.body;

    const job = await Job.create({
      title,
      description,
      budget,
      skills: skills || [],
      status: "open",
      escrowStatus: "created",
      client: req.user._id,
      escrow: {
        status: "created",
        onChainStatus: "created"
      }
    });

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
};

export const applyToJob = async (req, res, next) => {
  try {
    const { coverLetter, proposedRate } = req.body;
    const job = await ensureJob(req.params.id);

    if (job.status !== "open") {
      throw createHttpError("Applications are closed for this job", 400);
    }

    if (String(job.client) === String(req.user._id)) {
      throw createHttpError("Clients cannot apply to their own jobs", 400);
    }

    const application = await Application.create({
      job: job._id,
      freelancer: req.user._id,
      coverLetter,
      proposedRate,
      status: "pending"
    });

    res.status(201).json({ application });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "You have already applied to this job";
    }
    next(error);
  }
};

export const acceptApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      throw createHttpError("applicationId is required", 400);
    }

    const job = await ensureJob(req.params.id);
    ensureClientOwnership(job, req.user._id);

    if (job.status !== "open") {
      throw createHttpError("Only open jobs can accept applications", 400);
    }

    const application = await Application.findById(applicationId).populate("freelancer");

    if (!application || String(application.job) !== String(job._id)) {
      throw createHttpError("Application not found for this job", 404);
    }

    if (application.status !== "pending") {
      throw createHttpError("Only pending applications can be accepted", 400);
    }

    job.hiredFreelancer = application.freelancer._id;
    job.status = "accepted";
    job.escrowStatus = "created";
    job.escrow = {
      ...toEscrowObject(job),
      status: "created",
      onChainStatus: "created",
      onChainJobId: null,
      createTxHash: "",
      depositTxHash: "",
      completeTxHash: "",
      releaseTxHash: "",
      amountWei: "0",
      fundedAt: null,
      completedAt: null,
      releasedAt: null
    };
    await job.save();

    await Application.updateMany({ job: job._id }, { status: "rejected" });
    application.status = "accepted";
    await application.save();

    res.json({ job, application });
  } catch (error) {
    next(error);
  }
};

export const fundJobEscrow = async (req, res, next) => {
  try {
    const { onChainJobId, contractAddress, createTxHash, depositTxHash } = req.body;
    const job = await ensureJob(req.params.id);
    ensureClientOwnership(job, req.user._id);

    if (job.status !== "accepted") {
      throw createHttpError("Escrow can only be funded after an application is accepted", 400);
    }

    if (!job.hiredFreelancer) {
      throw createHttpError("A freelancer must be assigned before funding escrow", 400);
    }

    if (onChainJobId === undefined || onChainJobId === null) {
      throw createHttpError("onChainJobId is required", 400);
    }

    if (!depositTxHash) {
      throw createHttpError("depositTxHash is required", 400);
    }

    await verifyTransactionSuccess(depositTxHash);

    if (createTxHash) {
      await verifyTransactionSuccess(createTxHash);
    }

    const onChain = await fetchOnChainEscrowStatus(onChainJobId, contractAddress);

    if (onChain.status !== "funded") {
      throw createHttpError("Escrow is not funded on-chain yet", 400);
    }

    const clientWallet = req.user.walletAddress?.toLowerCase();
    const freelancerWallet = job.hiredFreelancer.walletAddress?.toLowerCase?.();

    if (clientWallet && onChain.client.toLowerCase() !== clientWallet) {
      throw createHttpError("On-chain client does not match the authenticated client wallet", 400);
    }

    if (freelancerWallet && onChain.freelancer.toLowerCase() !== freelancerWallet) {
      throw createHttpError("On-chain freelancer does not match the assigned freelancer wallet", 400);
    }

    syncEscrowSnapshot({
      job,
      onChain,
      txUpdates: {
        contractAddress: contractAddress || onChain.contractAddress,
        createTxHash: createTxHash || job.escrow?.createTxHash || "",
        depositTxHash
      },
      timestampField: "fundedAt"
    });
    job.status = "in_progress";
    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const completeJob = async (req, res, next) => {
  try {
    const { completeTxHash } = req.body;
    const job = await ensureJob(req.params.id);
    ensureAssignedFreelancer(job, req.user._id);

    if (job.status !== "in_progress") {
      throw createHttpError("Only in-progress jobs can be marked complete", 400);
    }

    if (job.escrowStatus !== "funded" || !job.escrow?.onChainJobId) {
      throw createHttpError("Escrow must be funded before completion", 400);
    }

    if (!completeTxHash) {
      throw createHttpError("completeTxHash is required", 400);
    }

    await verifyTransactionSuccess(completeTxHash);
    const onChain = await fetchOnChainEscrowStatus(job.escrow.onChainJobId, job.escrow.contractAddress);

    if (onChain.status !== "completed") {
      throw createHttpError("The escrow contract has not been marked completed yet", 400);
    }

    syncEscrowSnapshot({
      job,
      onChain,
      txUpdates: {
        completeTxHash
      },
      timestampField: "completedAt"
    });
    job.status = "completed";
    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const releaseJobPayment = async (req, res, next) => {
  try {
    const { releaseTxHash } = req.body;
    const job = await ensureJob(req.params.id);
    ensureClientOwnership(job, req.user._id);

    if (job.status !== "completed") {
      throw createHttpError("Only completed jobs can release payment", 400);
    }

    if (job.escrowStatus !== "funded" || !job.escrow?.onChainJobId) {
      throw createHttpError("Escrow must be funded before payment can be released", 400);
    }

    if (!releaseTxHash) {
      throw createHttpError("releaseTxHash is required", 400);
    }

    await verifyTransactionSuccess(releaseTxHash);
    const onChain = await fetchOnChainEscrowStatus(job.escrow.onChainJobId, job.escrow.contractAddress);

    if (onChain.status !== "released") {
      throw createHttpError("The escrow contract has not released payment yet", 400);
    }

    syncEscrowSnapshot({
      job,
      onChain,
      txUpdates: {
        releaseTxHash
      },
      timestampField: "releasedAt"
    });
    job.status = "paid";
    await job.save();

    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const getEscrowStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("client", "name email walletAddress")
      .populate("hiredFreelancer", "name email walletAddress");

    if (!job) {
      throw createHttpError("Job not found", 404);
    }

    if (!job.escrow?.onChainJobId) {
      return res.json({
        jobId: job._id,
        dbStatus: job.status,
        escrowStatus: job.escrowStatus,
        escrow: {
          ...toEscrowObject(job),
          onChainStatusAvailable: false
        }
      });
    }

    const onChain = await fetchOnChainEscrowStatus(job.escrow.onChainJobId, job.escrow.contractAddress);
    const previousJobStatus = job.status;
    const previousEscrowStatus = job.escrowStatus;
    const previousOnChainStatus = job.escrow?.onChainStatus;

    syncEscrowSnapshot({ job, onChain });

    if (onChain.status === "funded" && job.status === "accepted") {
      job.status = "in_progress";
    }

    if (onChain.status === "completed" && job.status === "in_progress") {
      job.status = "completed";
    }

    if (onChain.status === "released") {
      job.status = "paid";
    }

    if (
      job.status !== previousJobStatus ||
      job.escrowStatus !== previousEscrowStatus ||
      job.escrow?.onChainStatus !== previousOnChainStatus
    ) {
      await job.save();
    }

    res.json({
      jobId: job._id,
      dbStatus: job.status,
      escrowStatus: job.escrowStatus,
      escrow: {
        ...toEscrowObject(job),
        ...onChain,
        status: job.escrowStatus,
        onChainStatus: onChain.status,
        onChainStatusAvailable: true
      }
    });
  } catch (error) {
    next(error);
  }
};
