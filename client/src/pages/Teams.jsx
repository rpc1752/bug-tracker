import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  UserGroupIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Teams() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const {
    data: teams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/teams");
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      }
    },
  });

  const createTeamMutation = useMutation(
    async (teamData) => {
      const { data } = await api.post("/api/teams", teamData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["teams"]);
        setIsCreateModalOpen(false);
        setFormData({ name: "", description: "" });
        toast.success("Team created successfully");
      },
      onError: (error) => {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "Failed to create team");
        }
      },
    }
  );

  const deleteTeamMutation = useMutation(
    async (teamId) => {
      await api.delete(`/api/teams/${teamId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["teams"]);
        toast.success("Team deleted successfully");
      },
      onError: (error) => {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "Failed to delete team");
        }
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createTeamMutation.mutate(formData);
  };

  const handleDelete = (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading teams...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading teams. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => (
          <div
            key={team._id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {team.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/teams/${team._id}`}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(team._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {team.description && (
                <p className="mt-4 text-sm text-gray-600">{team.description}</p>
              )}
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                to={`/teams/${team._id}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Create Team</h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 input"
                    required
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
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 input"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTeamMutation.isLoading}
                    className="btn-primary"
                  >
                    {createTeamMutation.isLoading
                      ? "Creating..."
                      : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
