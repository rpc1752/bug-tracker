import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "../api/api";

export default function NewIssue() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    status: "",
    priority: "medium",
    assigneeId: "",
    labels: [],
    dueDate: "",
    estimatedTime: "",
  });

  // Fetch project data (includes members, issue types, statuses)
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/projects/${projectId}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Pre-select first type and status if available
      if (data?.issueTypes && data.issueTypes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          type: data.issueTypes[0].name,
        }));
      }
      if (data?.issueStatuses && data.issueStatuses.length > 0) {
        setFormData((prev) => ({
          ...prev,
          status: data.issueStatuses[0].name,
        }));
      }
    },
  });

  // Create issue mutation
  const createIssue = useMutation({
    mutationFn: async (issueData) => {
      // Ensure project data is loaded before attempting mutation
      if (!project) throw new Error("Project data not loaded yet.");

      // Prepare data for API, converting empty assigneeId to null
      const payload = {
        ...issueData,
        projectId,
        assigneeId: issueData.assigneeId === "" ? null : issueData.assigneeId,
        // Format type and status as objects as expected by the API
        type: {
          name: issueData.type,
          ...project.issueTypes.find((t) => t.name === issueData.type),
        },
        status: {
          name: issueData.status,
          ...project.issueStatuses.find((s) => s.name === issueData.status),
        },
      };

      const response = await apiClient.post("/api/issues", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Issue created successfully!");
      navigate(`/projects/${projectId}`);
    },
    onError: (error) => {
      console.error("Error creating issue:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create issue"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createIssue.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Deduplicate members based on user ID
  const uniqueMembers =
    project?.members?.reduce((acc, current) => {
      const x = acc.find((item) => item.user._id === current.user._id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []) || [];

  if (isLoadingProject) {
    return <div className="text-center py-8">Loading project details...</div>;
  }

  if (isProjectError) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load project. Please try again.
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">Project not found or not loaded.</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Issue</h1>
      <div className="mb-4">
        <span className="text-gray-600">Project: </span>
        <span className="font-medium">{project?.name}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
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
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {project?.issueTypes?.map((type) => (
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
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {project?.issueStatuses?.map((status) => (
                <option key={status.name} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="highest">Highest</option>
            </select>
          </div>

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
              value={formData.assigneeId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {uniqueMembers.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="estimatedTime"
              className="block text-sm font-medium text-gray-700"
            >
              Estimated Time (hours)
            </label>
            <input
              type="number"
              id="estimatedTime"
              name="estimatedTime"
              min="0"
              step="0.5"
              value={formData.estimatedTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createIssue.isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {createIssue.isLoading ? "Creating..." : "Create Issue"}
          </button>
        </div>
      </form>
    </div>
  );
}
