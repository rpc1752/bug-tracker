import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "../api/api";
import { useAuth } from "../hooks/useAuth";

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    teamId: "",
  });

  // Fetch teams for the dropdown
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await apiClient.get("/api/teams");
      return response.data;
    },
    onSuccess: (data) => {
      // Filter teams where user is admin
      const adminTeams = data.filter((team) =>
        team.members.some(
          (member) =>
            (member.user._id === user?._id ||
              (typeof member.user === "string" && member.user === user?._id)) &&
            member.role === "admin"
        )
      );

      // Pre-select the first team where user is admin, if available
      if (adminTeams.length > 0 && !formData.teamId) {
        setFormData((prev) => ({
          ...prev,
          teamId: adminTeams[0]._id,
        }));
      }
    },
    onError: (error) => {
      toast.error("Failed to load teams. Please try again.");
    },
    enabled: !!user, // Only run query when user is loaded
  });

  // Filter teams to only show those where the user is an admin
  const adminTeams =
    teams?.filter((team) =>
      team.members.some(
        (member) =>
          (member.user._id === user?._id ||
            (typeof member.user === "string" && member.user === user?._id)) &&
          member.role === "admin"
      )
    ) || [];

  const createProject = useMutation({
    mutationFn: async (projectData) => {
      const response = await apiClient.post("/api/projects", projectData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      navigate(`/projects/${data._id}`);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error(
          "Access denied. You need admin permissions in this team to create a project."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create project"
        );
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate(formData);
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Convert key to uppercase automatically if it's the key field
    if (e.target.name === "key") {
      value = value.toUpperCase();
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Generate a key based on the project name
  const generateKey = () => {
    if (formData.name) {
      // Take first letter plus first consonant after first letter
      const name = formData.name.trim();
      if (name.length > 1) {
        let key = name[0];
        for (let i = 1; i < name.length; i++) {
          const char = name[i].toUpperCase();
          if (!"AEIOU ".includes(char)) {
            key += char;
            break;
          }
        }
        // If no consonant found, just use first two letters
        if (key.length === 1 && name.length > 1) {
          key += name[1];
        }
        // Ensure at least 2 characters and append a number
        if (key.length === 1) {
          key += "P";
        }
        // Suggest the key
        setFormData({
          ...formData,
          key: key.toUpperCase() + "1",
        });
      }
    }
  };

  // Auto-generate a key when name changes and key is empty
  useEffect(() => {
    if (formData.name && !formData.key) {
      generateKey();
    }
  }, [formData.name]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      {isLoadingTeams ? (
        <div className="text-center py-4">Loading teams...</div>
      ) : adminTeams.length === 0 ? (
        <div className="text-center py-4">
          <p className="mb-4">
            You don't have admin access to any teams. You need to be an admin in
            a team to create projects.
          </p>
          <button
            onClick={() => navigate("/teams")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go to Teams
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700"
            >
              Project Key * (uppercase letters and numbers only)
            </label>
            <input
              type="text"
              id="key"
              name="key"
              required
              value={formData.key}
              onChange={handleChange}
              pattern="^[A-Z][A-Z0-9]+$"
              title="Project key must start with an uppercase letter and contain only uppercase letters and numbers"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for issue identifiers like KEY-123
            </p>
          </div>

          <div>
            <label
              htmlFor="teamId"
              className="block text-sm font-medium text-gray-700"
            >
              Team * (only teams where you're an admin are shown)
            </label>
            <select
              id="teamId"
              name="teamId"
              required
              value={formData.teamId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select a team
              </option>
              {adminTeams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isLoading || !formData.teamId}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {createProject.isLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
