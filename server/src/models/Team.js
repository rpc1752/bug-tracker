import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "developer", "tester", "viewer"],
          default: "developer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pendingInvitations: [
      {
        email: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "developer", "tester", "viewer"],
          default: "developer",
        },
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    settings: {
      allowPublicProjects: {
        type: Boolean,
        default: false,
      },
      defaultIssueLabels: [String],
      defaultIssuePriorities: {
        type: [String],
        default: ["Low", "Medium", "High", "Critical"],
      },
      defaultStatuses: {
        type: [String],
        default: ["To Do", "In Progress", "Review", "Done"],
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      memberApproval: {
        type: Boolean,
        default: false,
      },
      teamAvatar: {
        type: String,
        default: "",
      },
    },
    activity: [
      {
        action: {
          type: String,
          required: true,
          enum: [
            "team_created",
            "team_updated",
            "member_added",
            "member_removed",
            "member_role_updated",
            "project_added",
            "project_removed",
          ],
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add middleware to auto-populate references
teamSchema.pre(/^find/, function (next) {
  // Don't populate in these specific queries for performance
  if (this._skipPopulate) {
    return next();
  }

  // Otherwise populate the relevant fields
  this.populate({
    path: "members.user",
    select: "name email avatar",
  }).populate({
    path: "owner",
    select: "name email avatar",
  });

  next();
});

// Add method to check if a user is a team admin
teamSchema.methods.isUserAdmin = function (userId) {
  if (this.owner.toString() === userId.toString()) {
    return true; // Owner is always considered admin
  }

  const member = this.members.find((member) => {
    // Handle both cases - when user is already populated or when it's just an ID
    const memberId =
      typeof member.user === "object" ? member.user._id : member.user;
    return memberId && memberId.toString() === userId.toString();
  });

  return member && member.role === "admin";
};

// Add method to check if a user is a team member
teamSchema.methods.isMember = function (userId) {
  return this.members.some(
    (member) => member.user._id.toString() === userId.toString()
  );
};

// Method to add activity log
teamSchema.methods.addActivity = async function (action, userId, data = {}) {
  this.activity.push({
    action,
    user: userId,
    timestamp: new Date(),
    data,
  });

  // Keep only the last 100 activities
  if (this.activity.length > 100) {
    this.activity = this.activity.slice(-100);
  }

  return this.save();
};

const Team = mongoose.model("Team", teamSchema);

export default Team;
