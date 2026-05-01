import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    coverLetter: {
      type: String,
      required: true
    },
    proposedRate: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;

