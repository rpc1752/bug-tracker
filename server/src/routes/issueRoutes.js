import express from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

const router = express.Router();

// Validation middleware
const issueValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("projectId").notEmpty().withMessage("Project ID is required"),
  body("type").notEmpty().withMessage("Issue type is required"),
  body("status").notEmpty().withMessage("Status is required"),
  body("priority")
    .isIn(["lowest", "low", "medium", "high", "highest"])
    .withMessage("Invalid priority"),
];

// Create issue
router.post("/", auth, issueValidation, validate, async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      estimatedTime,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify issue type and status exist in project settings
    const issueType = project.issueTypes.find((t) => t.name === type.name);
    const issueStatus = project.issueStatuses.find(
      (s) => s.name === status.name
    );

    if (!issueType) {
      return res
        .status(400)
        .json({ message: "Invalid issue type for this project" });
    }

    if (!issueStatus) {
      return res
        .status(400)
        .json({ message: "Invalid status for this project" });
    }

    const issue = new Issue({
      project: projectId,
      title,
      description,
      type: issueType,
      status: {
        name: issueStatus.name,
        category: issueStatus.category,
      },
      priority,
      reporter: req.user._id,
      assignee: assigneeId,
      labels: labels || [],
      dueDate,
      estimatedTime,
    });

    await issue.save();

    await issue.populate([
      { path: "reporter", select: "name email avatar" },
      { path: "assignee", select: "name email avatar" },
      { path: "project", select: "name key" },
    ]);

    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all issues for a project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, type, priority, assignee } = req.query;

    const filter = { project: projectId };

    if (status) filter["status.name"] = status;
    if (type) filter["type.name"] = type;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const issues = await Issue.find(filter)
      .sort({ updatedAt: -1 })
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar");

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single issue by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .populate("project", "name key issueTypes issueStatuses")
      .populate("watchers", "name email avatar")
      .populate({
        path: "subtasks",
        select: "title status type priority",
        populate: {
          path: "assignee",
          select: "name avatar",
        },
      });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update issue
router.patch("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      estimatedTime,
      timeSpent,
    } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Create a changelog to track changes
    const changeLogs = [];

    if (title && title !== issue.title) {
      changeLogs.push({
        user: req.user._id,
        field: "title",
        oldValue: issue.title,
        newValue: title,
      });
      issue.title = title;
    }

    if (description !== undefined && description !== issue.description) {
      changeLogs.push({
        user: req.user._id,
        field: "description",
        oldValue: issue.description,
        newValue: description,
      });
      issue.description = description;
    }

    if (type && type.name !== issue.type.name) {
      changeLogs.push({
        user: req.user._id,
        field: "type",
        oldValue: issue.type,
        newValue: type,
      });
      issue.type = type;
    }

    if (status && status.name !== issue.status.name) {
      changeLogs.push({
        user: req.user._id,
        field: "status",
        oldValue: issue.status,
        newValue: status,
      });
      issue.status = status;
    }

    if (priority && priority !== issue.priority) {
      changeLogs.push({
        user: req.user._id,
        field: "priority",
        oldValue: issue.priority,
        newValue: priority,
      });
      issue.priority = priority;
    }

    if (assigneeId !== undefined) {
      const oldAssignee = issue.assignee ? issue.assignee.toString() : null;
      if (assigneeId !== oldAssignee) {
        changeLogs.push({
          user: req.user._id,
          field: "assignee",
          oldValue: oldAssignee,
          newValue: assigneeId,
        });
        issue.assignee = assigneeId || null;
      }
    }

    if (labels) {
      changeLogs.push({
        user: req.user._id,
        field: "labels",
        oldValue: issue.labels,
        newValue: labels,
      });
      issue.labels = labels;
    }

    if (dueDate !== undefined) {
      changeLogs.push({
        user: req.user._id,
        field: "dueDate",
        oldValue: issue.dueDate,
        newValue: dueDate,
      });
      issue.dueDate = dueDate;
    }

    if (estimatedTime !== undefined) {
      changeLogs.push({
        user: req.user._id,
        field: "estimatedTime",
        oldValue: issue.estimatedTime,
        newValue: estimatedTime,
      });
      issue.estimatedTime = estimatedTime;
    }

    if (timeSpent !== undefined) {
      changeLogs.push({
        user: req.user._id,
        field: "timeSpent",
        oldValue: issue.timeSpent,
        newValue: timeSpent,
      });
      issue.timeSpent = timeSpent;
    }

    if (changeLogs.length > 0) {
      issue.changeLogs.push(...changeLogs);
    }

    await issue.save();

    await issue.populate([
      { path: "reporter", select: "name email avatar" },
      { path: "assignee", select: "name email avatar" },
      { path: "project", select: "name key" },
    ]);

    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment
router.post(
  "/:id/comments",
  auth,
  [body("content").notEmpty().withMessage("Comment content is required")],
  validate,
  async (req, res) => {
    try {
      const { content, attachments } = req.body;

      const issue = await Issue.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      const comment = {
        author: req.user._id,
        content,
        attachments: attachments || [],
      };

      issue.comments.push(comment);
      await issue.save();

      const populatedIssue = await Issue.findById(issue._id).populate({
        path: "comments.author",
        select: "name email avatar",
      });

      const newComment =
        populatedIssue.comments[populatedIssue.comments.length - 1];

      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete issue
router.delete("/:id", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
