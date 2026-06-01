import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // e.g. CS601, IT402
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    type: {
      type: String,
      enum: ["Theory", "Practical", "Theory + Practical", "Elective"],
      default: "Theory",
    },
    maxMarks: {
      internal: { type: Number, default: 30 },
      external: { type: Number, default: 70 },
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    syllabus: {
      type: String, // URL to uploaded syllabus PDF
      default: "",
    },
    academicYear: {
      type: String,
      required: true,
      // e.g. "2024-25"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: total max marks
courseSchema.virtual("totalMaxMarks").get(function () {
  return this.maxMarks.internal + this.maxMarks.external;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

export default mongoose.model("Course", courseSchema);