import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, "Question prompt is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "Each question must have at least 2 options",
      },
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 20,
      min: 1,
      max: 240,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    questions: {
      type: [quizQuestionSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Quiz must contain at least one question",
      },
    },
  },
  { timestamps: true }
);

quizSchema.virtual("totalMarks").get(function () {
  const questions = Array.isArray(this.questions) ? this.questions : [];
  return questions.reduce((sum, q) => sum + (q.marks || 1), 0);
});

quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });

export default mongoose.model("Quiz", quizSchema);
