import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    selectedOption: { type: Number, default: -1 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "disqualified"],
      default: "in_progress",
    },
    tabSwitches: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
