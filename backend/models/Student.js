import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrollmentNo: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // e.g. MMMUT2021CS001
    },
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      enum: [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
      ],
    },
    programme: {
      type: String,
      enum: ["B.Tech", "M.Tech", "MBA", "MCA", "Ph.D"],
      default: "B.Tech",
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    batch: {
      type: String,
      required: true,
      // e.g. "2021-2025"
    },
    section: {
      type: String,
      enum: ["A", "B", "C", "D"],
      default: "A",
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
      default: "General",
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    admissionYear: {
      type: Number,
      required: true,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: full name from populated user
studentSchema.virtual("fullName", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.model("Student", studentSchema);