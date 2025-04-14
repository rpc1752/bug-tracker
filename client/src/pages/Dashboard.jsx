import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BugAntIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/Button";
import Card, { CardHeader, CardContent } from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    projects: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/activity"),
        ]);
        setStats(statsRes.data);
        setRecentActivity(activityRes.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert
          variant="error"
          title="Error Loading Dashboard"
          message={error}
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

  // Calculate percentage changes (dummy data for demonstration)
  const changes = {
    totalIssues: { value: 12, isIncrease: true },
    openIssues: { value: 5, isIncrease: true },
    resolvedIssues: { value: 18, isIncrease: true },
    projects: { value: 0, isIncrease: false },
  };

  const StatusCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    progressValue,
  }) => (
    <Card
      padding="large"
      className={`hover:border-${color}-200 relative overflow-hidden`}
    >
      <div
        className={`absolute right-0 top-0 h-16 w-16 bg-${color}-50 rounded-bl-2xl flex items-center justify-center`}
      >
        <Icon className={`h-8 w-8 text-${color}-400`} />
      </div>
      <div className="relative">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`ml-2 flex items-center text-sm ${
                change.isIncrease
                  ? title === "Open Issues"
                    ? "text-red-600"
                    : "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {change.isIncrease ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : change.value > 0 ? (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              ) : null}
              {change.value > 0 ? `${change.value}%` : "No change"}
            </p>
          )}
        </div>
        <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`bg-${color}-500 h-full rounded-full`}
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button to="/projects/new/issue" variant="primary" icon={BugAntIcon}>
          New Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total Issues"
          value={stats.totalIssues}
          icon={ChartBarIcon}
          color="primary"
          change={changes.totalIssues}
          progressValue={Math.min(100, stats.totalIssues / 2)}
        />

        <StatusCard
          title="Open Issues"
          value={stats.openIssues}
          icon={ExclamationTriangleIcon}
          color="yellow"
          change={changes.openIssues}
          progressValue={Math.min(100, stats.openIssues / 2)}
        />

        <StatusCard
          title="Resolved Issues"
          value={stats.resolvedIssues}
          icon={CheckCircleIcon}
          color="green"
          change={changes.resolvedIssues}
          progressValue={Math.min(100, stats.resolvedIssues / 2)}
        />

        <StatusCard
          title="Active Projects"
          value={stats.projects}
          icon={FolderIcon}
          color="blue"
          change={changes.projects}
          progressValue={Math.min(100, stats.projects * 5)}
        />
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Recent Activity"
          icon={ArrowTrendingUpIcon}
          action={
            <Button variant="link" to="/activity">
              View all
            </Button>
          }
        />

        <CardContent className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="px-1.5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-900">
                          <Button
                            variant="link"
                            to={`/projects/${activity.projectId}`}
                          >
                            {activity.projectName}
                          </Button>{" "}
                          - {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()} at{" "}
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant="info"
                        className="ml-2 flex-shrink-0"
                        size="xs"
                      >
                        {activity.type || "Update"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={ClockIcon}
              title="No recent activity"
              description="Activity will appear here as you work on projects"
              compact={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
