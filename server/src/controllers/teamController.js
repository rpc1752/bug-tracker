import Team from "../models/Team.js";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

// Helper function to generate a random token
const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = new Team({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await team.save();

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teams: team._id },
    });

    // Log activity
    await team.addActivity("team_created", req.user._id, { teamName: name });

    // Populate members before sending response
    await team.populate("members.user", "name email avatar");

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      "members.user": req.user._id,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("projects", "name key description")
      .populate("activity.user", "name avatar");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a member
    const isMember = team.isMember(req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can update team details" });
    }

    // Update basic info
    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    // Update settings if provided
    if (settings) {
      if (settings.allowPublicProjects !== undefined) {
        team.settings.allowPublicProjects = settings.allowPublicProjects;
      }
      if (settings.defaultIssueLabels) {
        team.settings.defaultIssueLabels = settings.defaultIssueLabels;
      }
      if (settings.defaultIssuePriorities) {
        team.settings.defaultIssuePriorities = settings.defaultIssuePriorities;
      }
      if (settings.defaultStatuses) {
        team.settings.defaultStatuses = settings.defaultStatuses;
      }
      if (settings.notificationsEnabled !== undefined) {
        team.settings.notificationsEnabled = settings.notificationsEnabled;
      }
      if (settings.memberApproval !== undefined) {
        team.settings.memberApproval = settings.memberApproval;
      }
      if (settings.teamAvatar) {
        team.settings.teamAvatar = settings.teamAvatar;
      }
    }

    await team.save();

    // Log activity
    await team.addActivity("team_updated", req.user._id, {
      teamName: team.name,
      updatedFields: Object.keys(req.body),
    });

    // Return updated team with populated references
    const updatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only team owner can delete the team" });
    }

    // Remove team from all members' teams array
    await User.updateMany({ teams: team._id }, { $pull: { teams: team._id } });

    // Delete the team
    await team.deleteOne();

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ message: error.message });
  }
};

// Member management

export const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user) {
      // Check if user is already a member
      const isMember = team.members.some(
        (member) => member.user.toString() === user._id.toString()
      );

      if (isMember) {
        return res
          .status(400)
          .json({ message: "User is already a team member" });
      }

      // Check if invitation already exists
      const existingInvitation = team.pendingInvitations.find(
        (invite) => invite.email === email
      );

      if (existingInvitation) {
        return res
          .status(400)
          .json({ message: "User has already been invited" });
      }

      // Add member directly
      team.members.push({
        user: user._id,
        role,
        joinedAt: new Date(),
      });

      // Add team to user's teams
      await User.findByIdAndUpdate(user._id, {
        $push: { teams: team._id },
      });

      // Log activity
      await team.addActivity("member_added", req.user._id, {
        memberName: user.name,
        memberEmail: user.email,
        role: role,
      });

      // Save the updated team
      await team.save();

      // Return updated team with populated members
      const updatedTeam = await Team.findById(team._id)
        .populate("owner", "name email avatar")
        .populate("members.user", "name email avatar");

      // Send notification to the added user
      if (team.settings.notificationsEnabled) {
        try {
          await sendEmail({
            to: user.email,
            subject: `You've been added to the ${team.name} team`,
            text: `You have been added as a ${role} to the ${team.name} team by ${req.user.name}.`,
            html: `<p>You have been added as a <strong>${role}</strong> to the <strong>${team.name}</strong> team by ${req.user.name}.</p>`,
          });
        } catch (emailError) {
          console.error("Failed to send notification email:", emailError);
        }
      }

      return res.json(updatedTeam);
    } else {
      // Create invitation for non-existing user
      const token = generateInvitationToken();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration

      // Add invitation to pending invitations
      team.pendingInvitations.push({
        email,
        role,
        token,
        expiresAt: expirationDate,
        invitedBy: req.user._id,
      });

      await team.save();

      // Send invitation email
      const inviteUrl = `${process.env.CLIENT_URL}/teams/join/${team._id}/${token}`;

      try {
        await sendEmail({
          to: email,
          subject: `You've been invited to join ${team.name} team`,
          text: `You've been invited by ${req.user.name} to join the ${team.name} team as a ${role}. Click the following link to accept: ${inviteUrl}`,
          html: `
            <h2>Team Invitation</h2>
            <p>You've been invited by ${req.user.name} to join the <strong>${team.name}</strong> team as a <strong>${role}</strong>.</p>
            <p>Click the button below to accept:</p>
            <a href="${inviteUrl}" style="display:inline-block;background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Accept Invitation</a>
            <p>This invitation expires in 7 days.</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
      }

      res.json({
        message: `Invitation sent to ${email}`,
        pendingInvitation: {
          email,
          role,
          expiresAt: expirationDate,
        },
      });
    }
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { role } = req.body;
    const { id: teamId, userId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can update member roles" });
    }

    // Check if target user is a member
    const memberIndex = team.members.findIndex(
      (member) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Prevent updating owner's role
    if (team.owner.toString() === userId) {
      return res
        .status(403)
        .json({ message: "Cannot update team owner's role" });
    }

    // Get member info before update for activity log
    const previousRole = team.members[memberIndex].role;
    const memberUser = await User.findById(userId).select("name email");

    // Update member role
    team.members[memberIndex].role = role;

    // Log activity
    await team.addActivity("member_role_updated", req.user._id, {
      memberName: memberUser?.name || "Unknown user",
      memberEmail: memberUser?.email || "unknown",
      previousRole,
      newRole: role,
    });

    await team.save();

    // Return updated team with populated members
    const updatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(updatedTeam);
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(400).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: teamId, userId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can remove members" });
    }

    // Prevent removing the owner
    if (team.owner.toString() === userId) {
      return res.status(403).json({ message: "Cannot remove team owner" });
    }

    // Find member info for activity log
    const memberToRemove = team.members.find(
      (member) => member.user.toString() === userId
    );

    if (!memberToRemove) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Get user details
    const userToRemove = await User.findById(userId).select("name email");

    // Remove member from team
    team.members = team.members.filter(
      (member) => member.user.toString() !== userId
    );

    // Log activity
    await team.addActivity("member_removed", req.user._id, {
      memberName: userToRemove?.name || "Unknown user",
      memberEmail: userToRemove?.email || "unknown",
      role: memberToRemove.role,
    });

    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id },
    });

    // Return updated team with populated members
    const updatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json(updatedTeam);
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(400).json({ message: error.message });
  }
};

// Invitation management

export const getInvitations = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can view invitations" });
    }

    // Populate the invitedBy field
    await team.populate("pendingInvitations.invitedBy", "name email avatar");

    res.json(team.pendingInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelInvitation = async (req, res) => {
  try {
    const { id: teamId, invitationId } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can cancel invitations" });
    }

    // Find the invitation
    const invitationIndex = team.pendingInvitations.findIndex(
      (inv) => inv._id.toString() === invitationId
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Remove the invitation using pull
    team.pendingInvitations.splice(invitationIndex, 1);
    await team.save();

    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    res.status(400).json({ message: error.message });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { teamId, token } = req.params;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find the invitation by token
    const invitationIndex = team.pendingInvitations.findIndex(
      (inv) => inv.token === token
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    const invitation = team.pendingInvitations[invitationIndex];

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      // Remove expired invitation
      team.pendingInvitations.splice(invitationIndex, 1);
      await team.save();
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // Check if email matches the user's email
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        message: "This invitation was sent to a different email address",
      });
    }

    // Check if user is already a member
    const isMember = team.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      // Remove the invitation
      team.pendingInvitations.splice(invitationIndex, 1);
      await team.save();
      return res
        .status(400)
        .json({ message: "You are already a member of this team" });
    }

    // Add user as a team member
    team.members.push({
      user: req.user._id,
      role: invitation.role,
      joinedAt: new Date(),
    });

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teams: team._id },
    });

    // Remove the invitation
    team.pendingInvitations.splice(invitationIndex, 1);

    // Log activity
    await team.addActivity("member_added", invitation.invitedBy, {
      memberName: req.user.name,
      memberEmail: req.user.email,
      role: invitation.role,
      viaInvitation: true,
    });

    await team.save();

    // Return updated team with populated references
    const updatedTeam = await Team.findById(team._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json({
      message: "You have successfully joined the team",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(400).json({ message: error.message });
  }
};

// Team settings management

export const updateTeamSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin
    if (!team.isUserAdmin(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only admins can update team settings" });
    }

    // Update each setting if provided
    if (settings) {
      Object.entries(settings).forEach(([key, value]) => {
        if (team.settings[key] !== undefined) {
          team.settings[key] = value;
        }
      });
    }

    // Log activity
    await team.addActivity("team_updated", req.user._id, {
      teamName: team.name,
      updatedSettings: Object.keys(settings || {}),
    });

    await team.save();

    res.json({
      message: "Team settings updated successfully",
      settings: team.settings,
    });
  } catch (error) {
    console.error("Error updating team settings:", error);
    res.status(400).json({ message: error.message });
  }
};

// Team activity log

export const getTeamActivity = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("activity.user", "name email avatar")
      .select("activity");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a member
    const isMember = await Team.findOne({
      _id: req.params.id,
      "members.user": req.user._id,
    });

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(team.activity);
  } catch (error) {
    console.error("Error fetching team activity:", error);
    res.status(500).json({ message: error.message });
  }
};
