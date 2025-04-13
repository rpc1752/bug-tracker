import express from "express";
import { body } from "express-validator";
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMember,
  removeMember,
  getInvitations,
  cancelInvitation,
  acceptInvitation,
  updateTeamSettings,
  getTeamActivity,
} from "../controllers/teamController.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Validation middleware
const teamValidation = [
  body("name").notEmpty().withMessage("Team name is required"),
  body("description").optional().trim(),
];

const memberValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("role")
    .isIn(["admin", "developer", "tester", "viewer"])
    .withMessage("Invalid role"),
];

const memberRoleValidation = [
  body("role")
    .isIn(["admin", "developer", "tester", "viewer"])
    .withMessage("Invalid role"),
];

const teamSettingsValidation = [
  body("settings").isObject().withMessage("Settings must be an object"),
  body("settings.allowPublicProjects").optional().isBoolean(),
  body("settings.defaultIssueLabels").optional().isArray(),
  body("settings.defaultIssuePriorities").optional().isArray(),
  body("settings.defaultStatuses").optional().isArray(),
  body("settings.notificationsEnabled").optional().isBoolean(),
  body("settings.memberApproval").optional().isBoolean(),
  body("settings.teamAvatar").optional().isString(),
];

// Core team routes
router.post("/", auth, teamValidation, validate, createTeam);
router.get("/", auth, getTeams);
router.get("/:id", auth, getTeam);
router.patch("/:id", auth, teamValidation, validate, updateTeam);
router.delete("/:id", auth, deleteTeam);

// Member management routes
router.post("/:id/members", auth, memberValidation, validate, addMember);
router.patch(
  "/:id/members/:userId",
  auth,
  memberRoleValidation,
  validate,
  updateMember
);
router.delete("/:id/members/:userId", auth, removeMember);

// Invitation management routes
router.get("/:id/invitations", auth, getInvitations);
router.delete("/:id/invitations/:invitationId", auth, cancelInvitation);
router.get("/join/:teamId/:token", auth, acceptInvitation);

// Team settings routes
router.patch(
  "/:id/settings",
  auth,
  teamSettingsValidation,
  validate,
  updateTeamSettings
);

// Team activity routes
router.get("/:id/activity", auth, getTeamActivity);

export default router;
