import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/api";

function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("issues");

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/projects/${projectId}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      }
    },
  });

  // Fetch issues for this project
  const {
    data: issues,
    isLoading: isLoadingIssues,
    isError: isIssuesError,
  } = useQuery({
    queryKey: ["issues", projectId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/api/issues/project/${projectId}`
        );
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      }
    },
    enabled: !!projectId && activeTab === "issues",
  });

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isProjectError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading project</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${
                activeTab === "issues"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("issues")}
            >
              Issues
            </button>
            <button
              className={`${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("members")}
            >
              Members
            </button>
            <button
              className={`${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      <div>
        {activeTab === "issues" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Issues</h2>
              <Link
                to={`/projects/${projectId}/issues/new`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                New Issue
              </Link>
            </div>

            {isLoadingIssues ? (
              <div className="flex justify-center py-8">
                <div className="text-lg">Loading issues...</div>
              </div>
            ) : isIssuesError ? (
              <div className="flex justify-center py-8">
                <div className="text-lg text-red-600">Error loading issues</div>
              </div>
            ) : issues?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {issues.map((issue) => (
                      <tr
                        key={issue._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/issues/${issue._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {project.key}-{issue.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {issue.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            style={{
                              backgroundColor: issue.type.color + "20",
                              color: issue.type.color,
                            }}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          >
                            {issue.type.icon} {issue.type.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {issue.status.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {issue.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">
                  No issues found for this project.
                </p>
                <Link
                  to={`/projects/${projectId}/issues/new`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Create your first issue
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            {project.members?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.members.map((member) => (
                  <div key={member.user?._id} className="border rounded p-4">
                    <div className="font-medium">{member.user?.name}</div>
                    <div className="text-gray-500">{member.user?.email}</div>
                    <div className="text-sm text-gray-500">
                      Role: {member.role}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No team members found.</p>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Issue Types</h3>
                <div className="flex flex-wrap gap-2">
                  {project.issueTypes?.map((type) => (
                    <div
                      key={type.name}
                      style={{
                        backgroundColor: type.color + "20",
                        color: type.color,
                      }}
                      className="px-3 py-1 rounded-full text-sm"
                    >
                      {type.icon} {type.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Issue Statuses</h3>
                <div className="flex flex-wrap gap-2">
                  {project.issueStatuses?.map((status) => (
                    <div
                      key={status.name}
                      style={{
                        backgroundColor: status.color + "20",
                        color: status.color,
                      }}
                      className="px-3 py-1 rounded-full text-sm"
                    >
                      {status.name} ({status.category})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Project;
