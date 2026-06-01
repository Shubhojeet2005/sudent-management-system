import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // e.g. MMMUT-FAC-001
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Humanities",
      ],
    },
    designation: {
      type: String,
      enum: [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
        "Guest Faculty",
      ],
      default: "Assistant Professor",
    },
    qualification: {
      type: String,
      trim: true,
      // e.g. "Ph.D in Computer Science"
    },
    specialization: {
      type: String,
      trim: true,
      // e.g. "Machine Learning, Data Science"
    },
    experience: {
      type: Number,
      default: 0,
      // years of teaching experience
    },
    joiningDate: {
      type: Date,
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

export default mongoose.model("Faculty", facultySchema);