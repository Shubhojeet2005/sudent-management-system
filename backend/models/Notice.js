import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Notice content is required"],
    },
    category: {
      type: String,
      enum: [
        "Academic",
        "Examination",
        "Placement",
        "Event",
        "Holiday",
        "Fee",
        "General",
      ],
      default: "General",
    },
    targetAudience: {
      type: [String],
      enum: ["all", "student", "faculty", "admin"],
      default: ["all"],
    },
    targetBranch: {
      type: [String],
      default: ["all"],
      // ["all"] or specific branches
    },
    targetSemester: {
      type: [Number],
      default: [],
      // empty = applies to all semesters
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachment: {
      type: String,
      default: "",
      // URL to uploaded PDF/image
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      // null = no expiry
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search functionality
noticeSchema.index({ title: "text", content: "text" });

// Instance method: increment view count
noticeSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

export default mongoose.model("Notice", noticeSchema);