import express from "express";
import {
  acceptApplication,
  applyToJob,
  completeJob,
  createJob,
  fundJobEscrow,
  getEscrowStatus,
  getJobById,
  getJobs,
  rejectApplication,
  releaseJobPayment
} from "../controllers/jobController.js";
import { createJobMessage, getJobMessages } from "../controllers/messageController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getJobById);
router.get("/:id/escrow-status", protect, getEscrowStatus);
router.get("/:id/messages", protect, getJobMessages);
router.post("/", protect, authorizeRoles("client"), createJob);
router.post("/:id/apply", protect, authorizeRoles("freelancer"), applyToJob);
router.post("/:id/accept", protect, authorizeRoles("client"), acceptApplication);
router.post("/:id/reject", protect, authorizeRoles("client"), rejectApplication);
router.post("/:id/messages", protect, createJobMessage);
router.post("/:id/fund", protect, authorizeRoles("client"), fundJobEscrow);
router.post("/:id/complete", protect, authorizeRoles("freelancer"), completeJob);
router.post("/:id/release", protect, authorizeRoles("client"), releaseJobPayment);

export default router;
