import Job from "../models/Job.js";
import Message from "../models/Message.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureChatAccess = async (jobId, userId) => {
  const job = await Job.findById(jobId)
    .populate("client", "name email role")
    .populate("hiredFreelancer", "name email role");

  if (!job) {
    throw createHttpError("Job not found", 404);
  }

  if (!job.hiredFreelancer || job.status === "open") {
    throw createHttpError("Chat opens after an application is accepted", 400);
  }

  const isClient = String(job.client?._id || job.client) === String(userId);
  const isFreelancer = String(job.hiredFreelancer?._id || job.hiredFreelancer) === String(userId);

  if (!isClient && !isFreelancer) {
    throw createHttpError("Only the client and assigned freelancer can access this chat", 403);
  }

  return job;
};

export const getJobMessages = async (req, res, next) => {
  try {
    const job = await ensureChatAccess(req.params.id, req.user._id);
    const messages = await Message.find({ job: job._id })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.json({ jobId: job._id, messages });
  } catch (error) {
    next(error);
  }
};

export const createJobMessage = async (req, res, next) => {
  try {
    const { text = "", attachment = null } = req.body;
    const trimmedText = text.trim();
    const hasAttachment = Boolean(attachment?.dataUrl);

    if (!trimmedText && !hasAttachment) {
      throw createHttpError("Message text or image is required", 400);
    }

    if (attachment?.size > 2 * 1024 * 1024) {
      throw createHttpError("Chat image must be 2 MB or smaller", 400);
    }

    if (hasAttachment && !attachment.type?.startsWith("image/")) {
      throw createHttpError("Only image attachments are supported", 400);
    }

    const job = await ensureChatAccess(req.params.id, req.user._id);
    const message = await Message.create({
      job: job._id,
      sender: req.user._id,
      text: trimmedText,
      attachment: hasAttachment ? attachment : undefined
    });

    await message.populate("sender", "name email role");

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};
