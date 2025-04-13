import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "../api/api";

export default function IssueView() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    type: "",
    status: "",
    priority: "",
    assigneeId: "",
    dueDate: "",
  });

  // Fetch issue details
  const {
    data: issue,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/issues/${issueId}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Initialize edit form with current data
      setEditData({
        title: data.title,
        description: data.description || "",
        type: data.type.name,
        status: data.status.name,
        priority: data.priority,
        assigneeId: data.assignee?._id || "",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
      });
    },
  });

  // Update issue mutation
  const updateIssue = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.patch(`/api/issues/${issueId}`, {
        ...data,
        type: issue.project.issueTypes.find((t) => t.name === data.type),
        status: issue.project.issueStatuses.find((s) => s.name === data.status),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issue", issueId]);
      setIsEditing(false);
      toast.success("Issue updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update issue");
    },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (comment) => {
      const response = await apiClient.post(`/api/issues/${issueId}/comments`, {
        content: comment,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issue", issueId]);
      setCommentText("");
      toast.success("Comment added");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateIssue.mutate(editData);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate(commentText);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading issue...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading issue</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          to={`/projects/${issue.project._id}`}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to {issue.project.name}
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm px-2 py-1 rounded bg-gray-100">
              {issue.project.key}-{issue.number}
            </span>
            {!isEditing ? (
              <h1 className="text-2xl font-bold">{issue.title}</h1>
            ) : null}
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Issue
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={updateIssue.isLoading}
              >
                {updateIssue.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="p-6">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={editData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {issue.project.issueTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {issue.project.issueStatuses.map((status) => (
                      <option key={status.name} value={status.name}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editData.priority}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="lowest">Lowest</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={editData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="assigneeId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assignee
                  </label>
                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={editData.assigneeId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {issue.project.members.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={editData.dueDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="prose max-w-none">
                  {issue.description ? (
                    <div className="whitespace-pre-wrap">
                      {issue.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No description provided
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <div className="mt-1 flex items-center">
                    <span
                      style={{
                        backgroundColor: issue.type.color + "20",
                        color: issue.type.color,
                      }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {issue.type.icon} {issue.type.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                      {issue.status.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Priority
                  </h3>
                  <div className="mt-1">{issue.priority}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Assignee
                  </h3>
                  <div className="mt-1">
                    {issue.assignee ? (
                      <div className="flex items-center">
                        {issue.assignee.avatar ? (
                          <img
                            src={issue.assignee.avatar}
                            alt={issue.assignee.name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            {issue.assignee.name[0]}
                          </div>
                        )}
                        {issue.assignee.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Reporter
                  </h3>
                  <div className="mt-1">
                    {issue.reporter ? (
                      <div className="flex items-center">
                        {issue.reporter.avatar ? (
                          <img
                            src={issue.reporter.avatar}
                            alt={issue.reporter.name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            {issue.reporter.name[0]}
                          </div>
                        )}
                        {issue.reporter.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </div>
                </div>

                {issue.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Due Date
                    </h3>
                    <div className="mt-1">
                      {new Date(issue.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <div className="mt-1">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Comments</h2>
              <div className="space-y-4">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment) => (
                    <div key={comment._id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          {comment.author.name ? comment.author.name[0] : "?"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {comment.author.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                            {comment.edited && (
                              <span className="ml-2 italic">(edited)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}

                <div className="mt-4">
                  <form onSubmit={handleCommentSubmit}>
                    <div className="mb-2">
                      <textarea
                        rows={3}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addComment.isLoading || !commentText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {addComment.isLoading ? "Adding..." : "Add Comment"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
