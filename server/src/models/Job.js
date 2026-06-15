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
    jobCode: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      uppercase: true,
      minlength: 5,
      maxlength: 5
    },
    category: {
      type: String,
      enum: ["web_dev", "design", "writing", "app_dev", "marketing", "other"],
      default: "other"
    },
    availabilityStatus: {
      type: String,
      enum: ["active", "taken"],
      default: "active"
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
    projectFile: {
      name: {
        type: String,
        default: ""
      },
      type: {
        type: String,
        default: ""
      },
      size: {
        type: Number,
        default: 0
      },
      dataUrl: {
        type: String,
        default: ""
      }
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
