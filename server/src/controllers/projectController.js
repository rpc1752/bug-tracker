import Project from "../models/Project.js";
import Team from "../models/Team.js";

export const createProject = async (req, res) => {
  try {
    const { name, key, description, teamId } = req.body;

    console.log(
      `Creating project: ${name} with key ${key} in team ${teamId} by user ${req.user._id}`
    );

    // Check if team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`Team not found with ID: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log(`Team found: ${team.name}`);
    console.log(
      `Team members: ${team.members
        .map((m) => `${m.user} (${m.role})`)
        .join(", ")}`
    );
    console.log(`User ID: ${req.user._id}`);

    // Check if user is a member and their role
    const userMember = team.members.find((member) => {
      const memberId =
        typeof member.user === "object" ? member.user._id : member.user;
      const isMatch =
        memberId && memberId.toString() === req.user._id.toString();
      console.log(
        `Checking member ${memberId} against user ${req.user._id}: ${
          isMatch ? "MATCH" : "NO MATCH"
        }`
      );
      return isMatch;
    });

    if (!userMember) {
      console.log(`User ${req.user._id} is not a member of team ${team.name}`);
      return res
        .status(403)
        .json({ message: "Access denied: You are not a member of this team" });
    }

    console.log(`User role in team: ${userMember.role}`);

    if (userMember.role !== "admin") {
      console.log(`User ${req.user._id} is not an admin in team ${team.name}`);
      return res
        .status(403)
        .json({
          message: "Access denied: You need admin permissions in this team",
        });
    }

    // Use team's isUserAdmin method if available
    if (team.isUserAdmin && !team.isUserAdmin(req.user._id)) {
      console.log(`isUserAdmin method returns false for user ${req.user._id}`);
      return res
        .status(403)
        .json({ message: "Access denied: Admin check failed" });
    }

    // Check if project key is unique within team
    const existingProject = await Project.findOne({ team: teamId, key });
    if (existingProject) {
      console.log(`Project key ${key} already exists in team ${team.name}`);
      return res
        .status(400)
        .json({ message: "Project key already exists in team" });
    }

    const project = new Project({
      name,
      key,
      description,
      team: teamId,
      lead: req.user._id,
      members: team.members,
    });

    await project.save();
    console.log(`Project created: ${project._id}`);

    // Add project to team's projects
    await Team.findByIdAndUpdate(teamId, {
      $push: { projects: project._id },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { teamId } = req.query;

    const query = teamId
      ? { team: teamId, "members.user": req.user._id }
      : { "members.user": req.user._id };

    const projects = await Project.find(query)
      .populate("team", "name")
      .populate("lead", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("team", "name")
      .populate("lead", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is a member
    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, lead, status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin
    const userMember = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    project.name = name;
    project.description = description;
    project.lead = lead;
    project.status = status;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin
    const userMember = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove project from team's projects
    await Team.findByIdAndUpdate(project.team, {
      $pull: { projects: project._id },
    });

    await project.remove();
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectSettings = async (req, res) => {
  try {
    const { issueTypes, issueStatuses, labels } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin
    const userMember = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (issueTypes) project.issueTypes = issueTypes;
    if (issueStatuses) project.issueStatuses = issueStatuses;
    if (labels) project.labels = labels;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
