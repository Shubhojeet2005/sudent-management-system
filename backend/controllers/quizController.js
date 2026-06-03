import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { getFacultyForUser, getStudentByUser } from "../helpers/profileHelper.js";

const quizPopulate = [
  { path: "course", select: "courseCode title branch semester" },
  { path: "createdBy", select: "employeeId department designation name" },
];

const sanitizeQuizForStudent = (quiz) => {
  const q = quiz.toObject ? quiz.toObject() : quiz;
  const questions = Array.isArray(q.questions) ? q.questions : [];
  return {
    ...q,
    questions: questions.map((item) => ({
      prompt: item.prompt,
      options: item.options,
      marks: item.marks,
    })),
  };
};

const calculateScore = (quiz, answers = []) => {
  const answerMap = new Map(answers.map((a) => [a.questionIndex, a.selectedOption]));
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  let score = 0;
  let totalMarks = 0;
  questions.forEach((q, idx) => {
    totalMarks += q.marks || 1;
    if (answerMap.get(idx) === q.correctOption) score += q.marks || 1;
  });
  return { score, totalMarks };
};

export const listQuizzes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isActive: true };

  if (req.query.course) filter.course = req.query.course;

  if (req.user.role === "faculty") {
    const profile = await getFacultyForUser(req.user._id);
    if (!profile) {
      res.status(404);
      throw new Error("Faculty profile not found");
    }
    filter.createdBy = profile._id;
  }

  if (req.user.role === "student") {
    filter.isPublished = true;
    const now = new Date();
    filter.$or = [{ startsAt: null }, { startsAt: { $lte: now } }];
    filter.$and = [{ $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }];
  }

  const [items, total] = await Promise.all([
    Quiz.find(filter).populate(quizPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Quiz.countDocuments(filter),
  ]);

  const mapped =
    req.user.role === "student" ? items.map((q) => sanitizeQuizForStudent(q)) : items;
  sendPaginated(res, mapped, buildPaginationMeta(total, page, limit));
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate(quizPopulate);
  if (!quiz || !quiz.isActive) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  if (req.user.role === "student") {
    if (!quiz.isPublished) {
      res.status(403);
      throw new Error("Quiz is not published yet");
    }
    return sendSuccess(res, 200, sanitizeQuizForStudent(quiz));
  }

  if (req.user.role === "faculty") {
    const profile = await getFacultyForUser(req.user._id);
    if (!profile || String(quiz.createdBy?._id || quiz.createdBy) !== String(profile._id)) {
      res.status(403);
      throw new Error("Not authorized to view this quiz");
    }
  }

  sendSuccess(res, 200, quiz);
});

export const createQuiz = asyncHandler(async (req, res) => {
  const profile = await getFacultyForUser(req.user._id);
  if (!profile && req.user.role === "faculty") {
    res.status(404);
    throw new Error("Faculty profile not found");
  }

  const {
    title,
    description,
    course,
    durationMinutes,
    startsAt,
    endsAt,
    questions = [],
  } = req.body;

  if (!title || !questions.length) {
    res.status(400);
    throw new Error("Title and at least one question are required");
  }

  const normalized = questions.map((q) => ({
    prompt: String(q.prompt || "").trim(),
    options: (q.options || []).map((o) => String(o || "").trim()).filter(Boolean),
    correctOption: Number(q.correctOption),
    marks: Number(q.marks || 1),
  }));

  const invalid = normalized.find(
    (q) => !q.prompt || q.options.length < 2 || q.correctOption < 0 || q.correctOption >= q.options.length
  );
  if (invalid) {
    res.status(400);
    throw new Error("Each question needs text, 2+ options, and a valid correct option");
  }

  const quiz = await Quiz.create({
    title: title.trim(),
    description: description || "",
    course: course || null,
    durationMinutes: Number(durationMinutes || 20),
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    createdBy: profile?._id || req.body.createdBy,
    questions: normalized,
  });

  await quiz.populate(quizPopulate);
  sendSuccess(res, 201, quiz, "Quiz created");
});

export const publishQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  if (req.user.role === "faculty") {
    const profile = await getFacultyForUser(req.user._id);
    if (!profile || String(quiz.createdBy) !== String(profile._id)) {
      res.status(403);
      throw new Error("Not authorized to publish this quiz");
    }
  }

  quiz.isPublished = true;
  await quiz.save();
  sendSuccess(res, 200, quiz, "Quiz published");
});

export const startQuizAttempt = asyncHandler(async (req, res) => {
  const student = await getStudentByUser(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || !quiz.isActive || !quiz.isPublished) {
    res.status(404);
    throw new Error("Quiz is unavailable");
  }

  const now = new Date();
  if (quiz.startsAt && new Date(quiz.startsAt) > now) {
    res.status(400);
    throw new Error("Quiz has not started yet");
  }
  if (quiz.endsAt && new Date(quiz.endsAt) < now) {
    res.status(400);
    throw new Error("Quiz has already ended");
  }

  let attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: student._id });
  if (!attempt) {
    attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: student._id,
      answers: quiz.questions.map((_, idx) => ({ questionIndex: idx, selectedOption: -1 })),
      status: "in_progress",
      startedAt: now,
    });
  }

  sendSuccess(
    res,
    200,
    {
      attemptId: attempt._id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      quiz: sanitizeQuizForStudent(quiz),
    },
    "Quiz started"
  );
});

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const student = await getStudentByUser(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || !quiz.isActive) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: student._id });
  if (!attempt) {
    res.status(404);
    throw new Error("Attempt not found. Start quiz first.");
  }
  if (attempt.status !== "in_progress") {
    return sendSuccess(res, 200, attempt, "Attempt already submitted");
  }

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const tabSwitched = Boolean(req.body.tabSwitched);
  attempt.answers = answers.map((a) => ({
    questionIndex: Number(a.questionIndex),
    selectedOption: Number(a.selectedOption),
  }));

  if (tabSwitched) {
    attempt.status = "disqualified";
    attempt.tabSwitches += 1;
  } else {
    attempt.status = "submitted";
  }

  const { score, totalMarks } = calculateScore(quiz, attempt.answers);
  attempt.score = tabSwitched ? 0 : score;
  attempt.totalMarks = totalMarks;
  attempt.submittedAt = new Date();
  await attempt.save();

  sendSuccess(res, 200, attempt, tabSwitched ? "Attempt disqualified due to tab switch" : "Quiz submitted");
});

export const getMyQuizAttempt = asyncHandler(async (req, res) => {
  const student = await getStudentByUser(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }
  const attempt = await QuizAttempt.findOne({ quiz: req.params.id, student: student._id });
  if (!attempt) {
    res.status(404);
    throw new Error("Attempt not found");
  }
  sendSuccess(res, 200, attempt);
});

export const listQuizAttempts = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate(quizPopulate);
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  if (req.user.role === "faculty") {
    const profile = await getFacultyForUser(req.user._id);
    if (!profile || String(quiz.createdBy?._id || quiz.createdBy) !== String(profile._id)) {
      res.status(403);
      throw new Error("Not authorized");
    }
  }

  const attempts = await QuizAttempt.find({ quiz: quiz._id })
    .populate({ path: "student", select: "enrollmentNo rollNo user", populate: { path: "user", select: "name" } })
    .sort({ submittedAt: -1, createdAt: -1 });

  sendSuccess(res, 200, attempts);
});

export const listMyQuizAttempts = asyncHandler(async (req, res) => {
  const student = await getStudentByUser(req.user._id);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const attempts = await QuizAttempt.find({ student: student._id })
    .populate({
      path: "quiz",
      select: "title description durationMinutes isPublished createdAt course",
      populate: { path: "course", select: "courseCode title" },
    })
    .sort({ submittedAt: -1, createdAt: -1 });

  sendSuccess(res, 200, attempts);
});
