import express from "express";
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  publishQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getMyQuizAttempt,
  listQuizAttempts,
  listMyQuizAttempts,
} from "../controllers/quizController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listQuizzes);
router.get("/attempts/me", authorize("student"), listMyQuizAttempts);
router.post("/", authorize("admin", "faculty"), createQuiz);
router.get("/:id", getQuiz);
router.post("/:id/publish", authorize("admin", "faculty"), publishQuiz);
router.get("/:id/attempts", authorize("admin", "faculty"), listQuizAttempts);
router.post("/:id/start", authorize("student"), startQuizAttempt);
router.post("/:id/submit", authorize("student"), submitQuizAttempt);
router.get("/:id/attempt/me", authorize("student"), getMyQuizAttempt);

export default router;
