import { useState, useEffect } from "react";
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ClockIcon,
  PencilIcon,
  DocumentTextIcon,
  UsersIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import Card, { CardHeader, CardContent } from "../components/Card";
import Button from "../components/Button";

// Mock data - replace with actual data fetching
const MOCK_USER = {
  id: "usr123",
  name: "Jane Cooper",
  email: "jane.cooper@example.com",
  jobTitle: "Frontend Developer",
  bio: "Passionate about creating intuitive user interfaces and solving complex problems with clean, maintainable code.",
  timezone: "America/New_York",
  avatar: null,
  joinDate: "2023-01-15",
  teams: [
    { id: "team1", name: "Frontend Team" },
    { id: "team2", name: "Design System" },
  ],
  stats: {
    issuesCreated: 37,
    issuesClosed: 24,
    issuesAssigned: 15,
    projectsContributed: 4,
  },
  recentActivity: [
    {
      id: "act1",
      type: "issue_created",
      title: "Fix navigation dropdown positioning",
      date: "2023-06-10T10:30:00Z",
      projectId: "proj1",
      projectName: "Bug Tracker",
    },
    {
      id: "act2",
      type: "issue_closed",
      title: "Implement dark mode toggle",
      date: "2023-06-08T16:45:00Z",
      projectId: "proj1",
      projectName: "Bug Tracker",
    },
    {
      id: "act3",
      type: "comment_added",
      title: "On issue: Refactor authentication flow",
      date: "2023-06-05T09:15:00Z",
      projectId: "proj2",
      projectName: "Customer Portal",
    },
  ],
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    bio: "",
    timezone: "UTC",
  });

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setUser(MOCK_USER);
      setFormData({
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        jobTitle: MOCK_USER.jobTitle,
        bio: MOCK_USER.bio,
        timezone: MOCK_USER.timezone,
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would save the profile data to the backend
    console.log("Profile data to save:", formData);

    // Update local user state to reflect changes
    setUser((prev) => ({
      ...prev,
      ...formData,
    }));

    setEditMode(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div
        className={`container mx-auto py-6 px-4 lg:px-8 ${
          darkMode ? "text-white" : ""
        }`}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto py-6 px-4 lg:px-8 ${
        darkMode ? "text-white" : ""
      }`}
    >
      <div className="mb-6">
        <Link
          to="/"
          className={`inline-flex items-center ${
            darkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - profile info */}
        <div className="w-full lg:w-2/3">
          <Card className="mb-6">
            <CardContent className="p-6">
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-primary-600/10 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={formData.name}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon
                            className={`h-16 w-16 ${
                              darkMode ? "text-primary-400" : "text-primary-500"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <h2
                        className={`text-xl font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Profile Picture
                      </h2>
                      <div className="mt-2 flex space-x-3">
                        <Button variant="primary" size="sm">
                          Change
                        </Button>
                        <Button
                          variant={darkMode ? "outline" : "secondary"}
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-400 focus:border-primary-400"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-400 focus:border-primary-400"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="jobTitle"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-400 focus:border-primary-400"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="timezone"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Timezone
                      </label>
                      <select
                        name="timezone"
                        id="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-primary-400 focus:border-primary-400"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="bio"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary-400 focus:border-primary-400"
                            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                        }`}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant={darkMode ? "outline" : "secondary"}
                      className="mr-3"
                      onClick={() => setEditMode(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className="h-24 w-24 rounded-full bg-primary-600/10 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon
                            className={`h-16 w-16 ${
                              darkMode ? "text-primary-400" : "text-primary-500"
                            }`}
                          />
                        )}
                      </div>
                      <div className="ml-6">
                        <h1
                          className={`text-2xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user.name}
                        </h1>
                        <p
                          className={`text-lg ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {user.jobTitle}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => setEditMode(true)}
                      className="flex items-center"
                      icon={PencilIcon}
                    >
                      Edit Profile
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-gray-700/50" : "bg-gray-100"
                        }`}
                      >
                        <EnvelopeIcon
                          className={`h-5 w-5 ${
                            darkMode ? "text-primary-400" : "text-primary-500"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Email
                        </p>
                        <p
                          className={darkMode ? "text-white" : "text-gray-900"}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-gray-700/50" : "bg-gray-100"
                        }`}
                      >
                        <BriefcaseIcon
                          className={`h-5 w-5 ${
                            darkMode ? "text-primary-400" : "text-primary-500"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Job Title
                        </p>
                        <p
                          className={darkMode ? "text-white" : "text-gray-900"}
                        >
                          {user.jobTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-gray-700/50" : "bg-gray-100"
                        }`}
                      >
                        <ClockIcon
                          className={`h-5 w-5 ${
                            darkMode ? "text-primary-400" : "text-primary-500"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Timezone
                        </p>
                        <p
                          className={darkMode ? "text-white" : "text-gray-900"}
                        >
                          {user.timezone.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-gray-700/50" : "bg-gray-100"
                        }`}
                      >
                        <CalendarIcon
                          className={`h-5 w-5 ${
                            darkMode ? "text-primary-400" : "text-primary-500"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Member Since
                        </p>
                        <p
                          className={darkMode ? "text-white" : "text-gray-900"}
                        >
                          {formatDate(user.joinDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3
                      className={`text-lg font-medium mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      About
                    </h3>
                    <p
                      className={`whitespace-pre-line ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {user.bio || "No bio provided."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader
              title="Activity"
              icon={DocumentTextIcon}
              titleClass={darkMode ? "text-white" : ""}
            />
            <CardContent className="p-6">
              {user.recentActivity.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {user.recentActivity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== user.recentActivity.length - 1 ? (
                            <span
                              className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  darkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                              >
                                {activity.type === "issue_created" ? (
                                  <PencilIcon
                                    className={`h-4 w-4 ${
                                      darkMode
                                        ? "text-primary-400"
                                        : "text-primary-500"
                                    }`}
                                  />
                                ) : activity.type === "issue_closed" ? (
                                  <CheckIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ChatIcon className="h-4 w-4 text-blue-500" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p
                                  className={`text-sm ${
                                    darkMode ? "text-gray-200" : "text-gray-900"
                                  }`}
                                >
                                  {activity.type === "issue_created" ? (
                                    <>Created issue: </>
                                  ) : activity.type === "issue_closed" ? (
                                    <>Closed issue: </>
                                  ) : (
                                    <>{activity.title}</>
                                  )}
                                  {(activity.type === "issue_created" ||
                                    activity.type === "issue_closed") && (
                                    <span className="font-medium">
                                      {activity.title}
                                    </span>
                                  )}
                                </p>
                                <p
                                  className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  {activity.projectName}
                                </p>
                              </div>
                              <div
                                className={`text-right text-sm whitespace-nowrap ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {formatDate(activity.date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p
                  className={`text-center py-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No recent activity.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - stats and teams */}
        <div className="w-full lg:w-1/3">
          <Card className="mb-6">
            <CardHeader
              title="Statistics"
              titleClass={darkMode ? "text-white" : ""}
            />
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-md p-4 text-center ${
                    darkMode ? "border-gray-700 bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-2xl font-bold text-primary-500">
                    {user.stats.issuesCreated}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Issues Created
                  </div>
                </div>
                <div
                  className={`border rounded-md p-4 text-center ${
                    darkMode ? "border-gray-700 bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-2xl font-bold text-green-500">
                    {user.stats.issuesClosed}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Issues Closed
                  </div>
                </div>
                <div
                  className={`border rounded-md p-4 text-center ${
                    darkMode ? "border-gray-700 bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-2xl font-bold text-yellow-500">
                    {user.stats.issuesAssigned}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Assigned Issues
                  </div>
                </div>
                <div
                  className={`border rounded-md p-4 text-center ${
                    darkMode ? "border-gray-700 bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <div className="text-2xl font-bold text-blue-500">
                    {user.stats.projectsContributed}
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Projects
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Teams"
              icon={UsersIcon}
              titleClass={darkMode ? "text-white" : ""}
            />
            <CardContent className="p-6">
              {user.teams.length > 0 ? (
                <ul
                  className={`divide-y ${
                    darkMode ? "divide-gray-700" : "divide-gray-200"
                  }`}
                >
                  {user.teams.map((team) => (
                    <li
                      key={team.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-600/10 flex items-center justify-center">
                          <UsersIcon
                            className={`h-4 w-4 ${
                              darkMode ? "text-primary-400" : "text-primary-600"
                            }`}
                          />
                        </div>
                        <p
                          className={`ml-3 text-sm font-medium ${
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {team.name}
                        </p>
                      </div>
                      <Link
                        to={`/teams/${team.id}`}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className={`text-center py-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Not a member of any teams.
                </p>
              )}
              <div className="mt-4">
                <Link
                  to="/teams"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  View all teams
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper icon components
function CheckIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function ChatIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6.8 2.99 1.95 3.99m9.3-3.99c0 1.6-.8 2.99-1.95 3.99m-9.3 0h9.3m-9.3 0c-1.16 1-1.95 2.39-1.95 3.99m1.95-3.99h-3c-.76 0-1.42.45-1.76 1.11m0 0a5.25 5.25 0 15.61-1.51m5.69 7.61c1.75 0 3.37-.67 4.62-1.79m.67.6a8.98 8.98 0 003.3-6.61 8.98 8.98 0 00-3.3-6.61"
      />
    </svg>
  );
}
