import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const changeLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

const issueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    number: {
      type: Number,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      name: {
        type: String,
        required: true,
      },
      icon: String,
      color: String,
    },
    status: {
      name: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        required: true,
      },
    },
    priority: {
      type: String,
      enum: ["lowest", "low", "medium", "high", "highest"],
      default: "medium",
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    labels: [
      {
        name: String,
        color: String,
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    comments: [commentSchema],
    changeLogs: [changeLogSchema],
    dueDate: Date,
    estimatedTime: Number, // in minutes
    timeSpent: Number, // in minutes
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
    },
    subtasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure issue number is unique within project
issueSchema.index({ project: 1, number: 1 }, { unique: true });

// Auto-increment issue number within project
issueSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const lastIssue = await this.constructor.findOne(
      { project: this.project },
      { number: 1 },
      { sort: { number: -1 } }
    );

    this.number = lastIssue ? lastIssue.number + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
