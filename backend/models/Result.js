import mongoose from "mongoose";

const subjectResultSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  internalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  externalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  totalMarks: {
    type: Number,
  },
  grade: {
    type: String,
    enum: ["O", "A+", "A", "B+", "B", "C", "P", "F", "Ab"],
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 10,
  },
  status: {
    type: String,
    enum: ["Pass", "Fail", "Absent"],
    default: "Pass",
  },
});

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      required: true,
      // e.g. "2024-25"
    },
    subjects: [subjectResultSchema],
    sgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    earnedCredits: {
      type: Number,
      default: 0,
    },
    result: {
      type: String,
      enum: ["Pass", "Fail", "Promoted", "Detained"],
      default: "Pass",
    },
    publishedAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate result for same student + semester + academic year
resultSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });

// Auto-calculate SGPA before saving
resultSchema.pre("save", function () {
  if (this.subjects && this.subjects.length > 0) {
    // Grade → Grade Points mapping (MMMUT/UGC pattern)
    const gradeMap = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, P: 4, F: 0, Ab: 0 };

    this.subjects.forEach((sub) => {
      sub.totalMarks = sub.internalMarks + sub.externalMarks;

      // Auto-assign grade from total marks (out of 100)
      const pct = sub.totalMarks;
      if (pct >= 90) sub.grade = "O";
      else if (pct >= 80) sub.grade = "A+";
      else if (pct >= 70) sub.grade = "A";
      else if (pct >= 60) sub.grade = "B+";
      else if (pct >= 50) sub.grade = "B";
      else if (pct >= 45) sub.grade = "C";
      else if (pct >= 40) sub.grade = "P";
      else sub.grade = "F";

      sub.gradePoints = gradeMap[sub.grade] || 0;
      sub.status = sub.grade === "F" || sub.grade === "Ab" ? "Fail" : "Pass";
    });
  }
});

export default mongoose.model("Result", resultSchema);