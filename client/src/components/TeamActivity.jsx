import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ClockIcon,
  UserPlusIcon,
  UserMinusIcon,
  PencilIcon,
  UserGroupIcon,
  FolderPlusIcon,
  FolderMinusIcon,
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

// Icon mapping for activity types
const ACTIVITY_ICONS = {
  team_created: UserGroupIcon,
  team_updated: PencilIcon,
  member_added: UserPlusIcon,
  member_removed: UserMinusIcon,
  member_role_updated: PencilIcon,
  project_added: FolderPlusIcon,
  project_removed: FolderMinusIcon,
};

// Format activity message based on action type and data
const formatActivityMessage = (activity) => {
  const { action, user, data } = activity;

  switch (action) {
    case "team_created":
      return `created team "${data.teamName}"`;
    case "team_updated":
      return `updated team information`;
    case "member_added":
      return data.viaInvitation
        ? `accepted invitation and joined as ${data.role}`
        : `added ${data.memberName} (${data.memberEmail}) as ${data.role}`;
    case "member_removed":
      return `removed ${data.memberName} (${data.memberEmail}) from the team`;
    case "member_role_updated":
      return `changed ${data.memberName}'s role from ${data.previousRole} to ${data.newRole}`;
    case "project_added":
      return `added project "${data.projectName}"`;
    case "project_removed":
      return `removed project "${data.projectName}"`;
    default:
      return "performed an action";
  }
};

export default function TeamActivity({ teamId }) {
  const {
    data: activities,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team-activity", teamId],
    queryFn: async () => {
      const { data } = await api.get(`/api/teams/${teamId}/activity`);
      return data;
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Team Activity</h3>
        </div>
        <div className="px-4 py-8 text-center text-gray-500">
          Loading activity...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Team Activity</h3>
        </div>
        <div className="px-4 py-8 text-center text-red-500">
          Error loading activity. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Team Activity</h3>
      </div>

      {activities && activities.length > 0 ? (
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const ActivityIcon = ACTIVITY_ICONS[activity.action] || ClockIcon;
              return (
                <li key={activity._id} className="py-4 px-4 sm:px-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <ActivityIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user ? activity.user.name : "Unknown user"}
                        </p>
                        <span className="ml-1 text-sm text-gray-500">
                          <span className="mx-1">•</span>
                          {formatActivityMessage(activity)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {format(
                          new Date(activity.timestamp),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-gray-500">
          No activity recorded yet.
        </div>
      )}
    </div>
  );
}
