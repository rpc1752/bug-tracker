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
        type: {
          name: data.type,
          ...issue.project.issueTypes.find((t) => t.name === data.type),
        },
        status: {
          name: data.status,
          category:
            issue.project.issueStatuses.find((s) => s.name === data.status)
              ?.category || "todo",
        },
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link
          to={`/projects/${issue.project._id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition-colors duration-200"
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

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-medium">
              {issue.project.key}-{issue.number}
            </span>
            {!isEditing ? (
              <h1 className="text-2xl font-bold text-gray-800">
                {issue.title}
              </h1>
            ) : null}
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
              Edit Issue
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2"
                disabled={updateIssue.isLoading}
              >
                {updateIssue.isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="p-8">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Issue Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editData.title}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Issue Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={editData.type}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  >
                    {issue?.project?.issueTypes?.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editData.status}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  >
                    {issue?.project?.issueStatuses?.map((status) => (
                      <option key={status.name} value={status.name}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editData.priority}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={editData.description}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="assigneeId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Assignee
                  </label>
                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={editData.assigneeId}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  >
                    <option value="">Unassigned</option>
                    {issue?.project?.members?.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={editData.dueDate}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-3">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Description
                  </h3>
                  <div className="prose prose-blue max-w-none bg-gray-50 p-5 rounded-lg border border-gray-100">
                    {issue.description ? (
                      <div className="whitespace-pre-wrap text-gray-800">
                        {issue.description}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">
                        No description provided
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Type
                  </h3>
                  <div className="mt-1 flex items-center">
                    <span
                      style={{
                        backgroundColor: issue.type.color + "20",
                        color: issue.type.color,
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {issue.type.icon} {issue.type.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Status
                  </h3>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {issue.status.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Priority
                  </h3>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${
                        issue.priority === "highest"
                          ? "bg-red-100 text-red-800"
                          : issue.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : issue.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : issue.priority === "low"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {issue.priority.charAt(0).toUpperCase() +
                        issue.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Assignee
                  </h3>
                  <div className="mt-1">
                    {issue.assignee ? (
                      <div className="flex items-center">
                        {issue.assignee.avatar ? (
                          <img
                            src={issue.assignee.avatar}
                            alt={issue.assignee.name}
                            className="h-8 w-8 rounded-full mr-2 border border-gray-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 font-medium">
                            {issue.assignee.name[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-700">
                          {issue.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Reporter
                  </h3>
                  <div className="mt-1">
                    {issue.reporter ? (
                      <div className="flex items-center">
                        {issue.reporter.avatar ? (
                          <img
                            src={issue.reporter.avatar}
                            alt={issue.reporter.name}
                            className="h-8 w-8 rounded-full mr-2 border border-gray-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-2 font-medium">
                            {issue.reporter.name[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-700">
                          {issue.reporter.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unknown</span>
                    )}
                  </div>
                </div>

                {issue.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Due Date
                    </h3>
                    <div className="mt-1 font-medium text-gray-700">
                      {new Date(issue.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Created
                  </h3>
                  <div className="mt-1 font-medium text-gray-700">
                    {new Date(issue.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                    clipRule="evenodd"
                  />
                </svg>
                Comments ({issue.comments?.length || 0})
              </h2>
              <div className="space-y-6">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
                    >
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 font-medium">
                          {comment.author.name ? comment.author.name[0] : "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {comment.author.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                            {comment.edited && (
                              <span className="ml-2 italic">(edited)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
                        {comment.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                    No comments yet
                  </p>
                )}

                <div className="mt-6">
                  <form
                    onSubmit={handleCommentSubmit}
                    className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                  >
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Add a comment
                    </h3>
                    <div className="mb-4">
                      <textarea
                        rows={4}
                        placeholder="Write your comment here..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addComment.isLoading || !commentText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {addComment.isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add Comment
                        </>
                      )}
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
