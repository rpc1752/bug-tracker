import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "developer", "tester"],
          default: "developer",
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived", "on-hold"],
      default: "active",
    },
    issueTypes: [
      {
        name: {
          type: String,
          required: true,
        },
        icon: String,
        color: String,
      },
    ],
    issueStatuses: [
      {
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          enum: ["todo", "in-progress", "done"],
          required: true,
        },
        color: String,
        order: Number,
      },
    ],
    labels: [
      {
        name: String,
        color: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure project key is unique within team
projectSchema.index({ team: 1, key: 1 }, { unique: true });

// Default issue types
projectSchema.pre("save", function (next) {
  if (this.isNew && !this.issueTypes.length) {
    this.issueTypes = [
      { name: "Bug", icon: "🐛", color: "#E53E3E" },
      { name: "Feature", icon: "✨", color: "#38A169" },
      { name: "Task", icon: "📋", color: "#4299E1" },
    ];
  }

  if (this.isNew && !this.issueStatuses.length) {
    this.issueStatuses = [
      { name: "To Do", category: "todo", color: "#718096", order: 0 },
      {
        name: "In Progress",
        category: "in-progress",
        color: "#4299E1",
        order: 1,
      },
      { name: "Review", category: "in-progress", color: "#9F7AEA", order: 2 },
      { name: "Done", category: "done", color: "#38A169", order: 3 },
    ];
  }

  next();
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
