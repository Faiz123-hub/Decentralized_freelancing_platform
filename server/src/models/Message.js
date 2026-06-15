import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      default: "",
      maxlength: 2000
    },
    attachment: {
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
    }
  },
  { timestamps: true }
);

messageSchema.index({ job: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
