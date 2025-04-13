import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  UserPlusIcon,
  UserMinusIcon,
  PencilIcon,
  UserIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ClockIcon,
  EnvelopeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import TeamActivity from "../components/TeamActivity";
import TeamInvitations from "../components/TeamInvitations";

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

const ROLE_BADGES = {
  admin: "bg-purple-100 text-purple-800",
  developer: "bg-blue-100 text-blue-800",
  tester: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

const TABS = [
  { id: "members", label: "Members", icon: UsersIcon },
  { id: "invitations", label: "Invitations", icon: EnvelopeIcon },
  { id: "activity", label: "Activity", icon: ClockIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function Team() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [memberData, setMemberData] = useState({
    email: "",
    role: "developer",
  });
  const [settingsData, setSettingsData] = useState({
    allowPublicProjects: false,
    defaultIssueLabels: [],
    defaultIssuePriorities: ["Low", "Medium", "High", "Critical"],
    defaultStatuses: ["To Do", "In Progress", "Review", "Done"],
    notificationsEnabled: true,
    memberApproval: false,
    teamAvatar: "",
  });
  const [selectedMember, setSelectedMember] = useState(null);

  const {
    data: team,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/teams/${id}`);
        setFormData({
          name: data.name,
          description: data.description,
        });
        if (data.settings) {
          setSettingsData({
            ...settingsData,
            ...data.settings,
          });
        }
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      }
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (teamData) => {
      const { data } = await api.patch(`/api/teams/${id}`, teamData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      setIsEditModalOpen(false);
      toast.success("Team updated successfully");
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to update team");
      }
    },
  });

  const updateTeamSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const { data } = await api.patch(`/api/teams/${id}/settings`, {
        settings,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      setIsSettingsModalOpen(false);
      toast.success("Team settings updated successfully");
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update team settings"
        );
      }
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (memberData) => {
      const { data } = await api.post(`/api/teams/${id}/members`, memberData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["team", id]);
      // If the response has pendingInvitation, it means an invitation was sent
      if (data.pendingInvitation) {
        queryClient.invalidateQueries(["team-invitations", id]);
        // Switch to invitations tab
        setActiveTab("invitations");
        toast.success(`Invitation sent to ${data.pendingInvitation.email}`);
      } else {
        toast.success("Member added successfully");
      }
      setIsAddMemberModalOpen(false);
      setMemberData({ email: "", role: "developer" });
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to add member");
      }
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.patch(`/api/teams/${id}/members/${userId}`, {
        role,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      setIsEditMemberModalOpen(false);
      setSelectedMember(null);
      toast.success("Member role updated successfully");
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update member role"
        );
      }
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/api/teams/${id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team", id]);
      toast.success("Member removed successfully");
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to remove member");
      }
    },
  });

  const handleUpdateTeam = (e) => {
    e.preventDefault();
    updateTeamMutation.mutate(formData);
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    updateTeamSettingsMutation.mutate(settingsData);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    addMemberMutation.mutate(memberData);
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    updateMemberMutation.mutate({
      userId: selectedMember.user._id,
      role: memberData.role,
    });
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate(userId);
    }
  };

  const filteredMembers = team?.members.filter(
    (member) =>
      member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team details...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading team details. Please try again.
        </div>
      </div>
    );
  }

  const isTeamAdmin = team.members.some(
    (member) => member.user._id === team.owner._id && member.role === "admin"
  );

  const isCurrentUserAdmin = team.members.some(
    (member) => member.user._id === team.owner._id && member.role === "admin"
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          {team.description && (
            <p className="mt-1 text-sm text-gray-600">{team.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          {isCurrentUserAdmin && (
            <>
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="btn-primary flex items-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Member
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Team
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              // Only show invitations tab to admins
              if (tab.id === "invitations" && !isCurrentUserAdmin) {
                return null;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 flex items-center text-sm font-medium ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary-500 text-primary-600"
                      : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-2 ${
                      activeTab === tab.id
                        ? "text-primary-500"
                        : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "members" && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Team Members ({team.members.length})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredMembers?.map((member) => (
              <div
                key={member.user._id}
                className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.name}
                      {member.user._id === team.owner._id && (
                        <ShieldCheckIcon className="h-4 w-4 text-primary-500 inline ml-1" />
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      ROLE_BADGES[member.role]
                    }`}
                  >
                    {member.role}
                  </span>
                  {isCurrentUserAdmin && team.owner._id !== member.user._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setMemberData({ ...memberData, role: member.role });
                          setIsEditMemberModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <UserMinusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredMembers?.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No members found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "invitations" && isCurrentUserAdmin && (
        <TeamInvitations teamId={id} />
      )}

      {activeTab === "activity" && <TeamActivity teamId={id} />}

      {activeTab === "settings" && isCurrentUserAdmin && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Team Settings
            </h3>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="btn-primary"
            >
              Edit Team Settings
            </button>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Team</h3>
              <form onSubmit={handleUpdateTeam} className="mt-4 space-y-4">
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
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTeamMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateTeamMutation.isLoading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Team Member
              </h3>
              <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={memberData.email}
                    onChange={(e) =>
                      setMemberData({ ...memberData, email: e.target.value })
                    }
                    className="mt-1 input"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={memberData.role}
                    onChange={(e) =>
                      setMemberData({ ...memberData, role: e.target.value })
                    }
                    className="mt-1 input"
                  >
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberMutation.isLoading}
                    className="btn-primary"
                  >
                    {addMemberMutation.isLoading ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditMemberModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Member Role
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Update role for {selectedMember.user.name}
                </p>
              </div>
              <form onSubmit={handleUpdateMember} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="edit-role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role
                  </label>
                  <select
                    id="edit-role"
                    name="role"
                    value={memberData.role}
                    onChange={(e) =>
                      setMemberData({ ...memberData, role: e.target.value })
                    }
                    className="mt-1 input"
                  >
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMemberModalOpen(false);
                      setSelectedMember(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMemberMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateMemberMutation.isLoading
                      ? "Updating..."
                      : "Update Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Team Settings
              </h3>
              <form onSubmit={handleUpdateSettings} className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowPublicProjects"
                      checked={settingsData.allowPublicProjects}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          allowPublicProjects: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="allowPublicProjects"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Allow public projects
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notificationsEnabled"
                      checked={settingsData.notificationsEnabled}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          notificationsEnabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="notificationsEnabled"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Enable team notifications
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="memberApproval"
                      checked={settingsData.memberApproval}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          memberApproval: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="memberApproval"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Require admin approval for new members
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTeamSettingsMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateTeamSettingsMutation.isLoading
                      ? "Saving..."
                      : "Save Settings"}
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
