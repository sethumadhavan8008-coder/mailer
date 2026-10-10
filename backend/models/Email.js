const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    recipients: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "failed",
    },
    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Email", emailSchema);
