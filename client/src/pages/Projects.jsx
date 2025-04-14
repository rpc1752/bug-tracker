import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/api";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderPlusIcon,
  FolderIcon,
  ClockIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";

function Projects() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/projects");
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert
          variant="error"
          title="Error Loading Projects"
          message="There was an error loading your projects."
          actions={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button to="/projects/new" variant="primary" icon={FolderPlusIcon}>
          New Project
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          className="pl-10 input focus:ring-2 focus:ring-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              as="div"
              hover={true}
              className="flex flex-col h-full"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <FolderIcon className="h-6 w-6" />
                </div>
                <div className="ml-3 flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                    {project.name}
                  </h2>
                  {project.status && (
                    <Badge
                      variant={
                        project.status === "active"
                          ? "success"
                          : project.status === "completed"
                          ? "info"
                          : "warning"
                      }
                      className="mt-1"
                      size="xs"
                      dot
                    >
                      {project.status === "active"
                        ? "Active"
                        : project.status === "completed"
                        ? "Completed"
                        : "Draft"}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 flex-grow mb-4">
                {project.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <HashtagIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{project.issues?.length || 0} issues</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderIcon}
          title="No projects found"
          description={
            searchTerm
              ? `No projects matching "${searchTerm}"`
              : "You haven't created any projects yet. Start by creating your first project."
          }
          buttonText="Create First Project"
          buttonIcon={PlusIcon}
          buttonTo="/projects/new"
        />
      )}
    </div>
  );
}

export default Projects;
