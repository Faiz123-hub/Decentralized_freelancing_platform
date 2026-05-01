import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    budget: {
      type: Number,
      required: true
    },
    skills: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["open", "accepted", "in_progress", "completed", "paid"],
      default: "open"
    },
    escrowStatus: {
      type: String,
      enum: ["created", "funded", "released"],
      default: "created"
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hiredFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    escrow: {
      onChainJobId: {
        type: Number,
        default: null
      },
      contractAddress: {
        type: String,
        default: ""
      },
      status: {
        type: String,
        enum: ["created", "funded", "released"],
        default: "created"
      },
      onChainStatus: {
        type: String,
        default: "created"
      },
      createTxHash: {
        type: String,
        default: ""
      },
      depositTxHash: {
        type: String,
        default: ""
      },
      completeTxHash: {
        type: String,
        default: ""
      },
      releaseTxHash: {
        type: String,
        default: ""
      },
      amountWei: {
        type: String,
        default: "0"
      },
      fundedAt: Date,
      completedAt: Date,
      releasedAt: Date
    }
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
