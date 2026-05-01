import express from "express";
import {
  getClientDashboard,
  getFreelancerDashboard
} from "../controllers/dashboardController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/client", protect, authorizeRoles("client"), getClientDashboard);
router.get("/freelancer", protect, authorizeRoles("freelancer"), getFreelancerDashboard);

export default router;

