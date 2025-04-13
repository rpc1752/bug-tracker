import express from "express";
import { body } from "express-validator";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectSettings,
} from "../controllers/projectController.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Validation middleware
const projectValidation = [
  body("name").notEmpty().withMessage("Project name is required"),
  body("key")
    .notEmpty()
    .withMessage("Project key is required")
    .matches(/^[A-Z][A-Z0-9]+$/)
    .withMessage("Project key must be uppercase letters and numbers"),
  body("teamId").notEmpty().withMessage("Team ID is required"),
  body("description").optional().trim(),
];

const projectUpdateValidation = [
  body("name").notEmpty().withMessage("Project name is required"),
  body("description").optional().trim(),
  body("lead").optional().isMongoId().withMessage("Invalid lead ID"),
  body("status")
    .optional()
    .isIn(["active", "archived", "on-hold"])
    .withMessage("Invalid status"),
];

const settingsValidation = [
  body("issueTypes").optional().isArray(),
  body("issueTypes.*.name").optional().notEmpty(),
  body("issueStatuses").optional().isArray(),
  body("issueStatuses.*.name").optional().notEmpty(),
  body("issueStatuses.*.category")
    .optional()
    .isIn(["todo", "in-progress", "done"]),
  body("labels").optional().isArray(),
  body("labels.*.name").optional().notEmpty(),
];

// Routes
router.post("/", auth, projectValidation, validate, createProject);
router.get("/", auth, getProjects);
router.get("/:id", auth, getProject);
router.patch("/:id", auth, projectUpdateValidation, validate, updateProject);
router.delete("/:id", auth, deleteProject);
router.patch(
  "/:id/settings",
  auth,
  settingsValidation,
  validate,
  updateProjectSettings
);

export default router;
