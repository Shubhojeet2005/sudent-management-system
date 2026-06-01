import mongoose from "mongoose";

// Single attendance record = one student, one course, one date
const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Medical Leave"],
      default: "Absent",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate record for same student + course + date
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Static method: get attendance summary for a student in a course
attendanceSchema.statics.getSummary = async function (studentId, courseId) {
  const records = await this.find({ student: studentId, course: courseId });
  const total = records.length;
  const present = records.filter(
    (r) => r.status === "Present" || r.status === "Late"
  ).length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
  return { total, present, absent: total - present, percentage };
};

export default mongoose.model("Attendance", attendanceSchema);