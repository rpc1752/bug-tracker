import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { DarkModeProvider } from "./context/DarkModeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import NewProject from "./pages/NewProject";
import NewIssue from "./pages/NewIssue";
import IssueView from "./pages/IssueView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Teams from "./pages/Teams";
import Team from "./pages/Team";
import JoinTeam from "./pages/JoinTeam";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <DarkModeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/:projectId" element={<Project />} />
          <Route path="projects/:projectId/issues/new" element={<NewIssue />} />
          <Route path="issues/:issueId" element={<IssueView />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id" element={<Team />} />
          <Route path="teams/join/:teamId/:token" element={<JoinTeam />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DarkModeProvider>
  );
}

export default App;
