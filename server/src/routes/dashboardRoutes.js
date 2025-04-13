import express from "express";
import { auth } from "../middleware/auth.js";
import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

const router = express.Router();

// Get dashboard statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const userProjects = await Project.find({
      "members.user": req.user._id,
    });

    const projectIds = userProjects.map((project) => project._id);

    const [totalIssues, openIssues, resolvedIssues] = await Promise.all([
      Issue.countDocuments({ project: { $in: projectIds } }),
      Issue.countDocuments({
        project: { $in: projectIds },
        "status.category": { $ne: "done" },
      }),
      Issue.countDocuments({
        project: { $in: projectIds },
        "status.category": "done",
      }),
    ]);

    res.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      projects: userProjects.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get("/activity", auth, async (req, res) => {
  try {
    const userProjects = await Project.find({
      "members.user": req.user._id,
    });

    const projectIds = userProjects.map((project) => project._id);

    const recentIssues = await Issue.find({
      project: { $in: projectIds },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("project", "name")
      .populate("reporter", "name")
      .populate("assignee", "name");

    const activity = recentIssues.map((issue) => ({
      id: issue._id,
      projectId: issue.project._id,
      projectName: issue.project.name,
      description: `${issue.reporter.name} ${
        issue.updatedAt > issue.createdAt ? "updated" : "created"
      } issue "${issue.title}"`,
      createdAt:
        issue.updatedAt > issue.createdAt ? issue.updatedAt : issue.createdAt,
    }));

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
