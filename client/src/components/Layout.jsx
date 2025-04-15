import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../context/DarkModeContext";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Button from "./Button";

const navigation = [
  { name: "Dashboard", to: "/", icon: HomeIcon },
  { name: "Projects", to: "/projects", icon: FolderIcon },
  { name: "Teams", to: "/teams", icon: UserGroupIcon },
  { name: "Profile", to: "/profile", icon: UserCircleIcon },
  { name: "Settings", to: "/settings", icon: Cog6ToothIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close sidebar when location changes (mobile view)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-[var(--bg-secondary)] border-r border-[var(--border-color)] shadow-lg`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--border-color)]">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Bug Tracker
            </span>
          </Link>
          <Button
            variant="ghost"
            className="md:hidden h-9 w-9 p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            onClick={() => setSidebarOpen(false)}
            icon={XMarkIcon}
          />
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-[var(--text-primary)]">
                {user?.name || "User"}
              </p>
              <p className="text-xs truncate text-[var(--text-tertiary)]">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Button
                key={item.name}
                to={item.to}
                variant="ghost"
                className={`justify-start w-full ${
                  isActive
                    ? darkMode
                      ? "bg-primary-900/50 text-primary-300 border-l-4 border-primary-400"
                      : "bg-primary-50 text-primary-700 border-l-4 border-primary-500"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
                icon={item.icon}
              >
                <span>{item.name}</span>
                {isActive && !darkMode && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-primary-500"></span>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-[var(--border-color)] p-4">
          <Button
            variant={darkMode ? "primary" : "secondary"}
            onClick={handleLogout}
            className="w-full justify-center"
            icon={ArrowRightOnRectangleIcon}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                onClick={() => setSidebarOpen(true)}
                icon={Bars3Icon}
              />
            </div>

            <div className="flex-1 md:ml-0"></div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                icon={BellIcon}
              />

              <Button
                variant="ghost"
                className={`h-9 w-9 p-0 rounded-full hover:bg-[var(--bg-tertiary)] ${
                  darkMode ? "text-yellow-300" : "text-[var(--text-secondary)]"
                }`}
                onClick={toggleDarkMode}
                icon={darkMode ? SunIcon : MoonIcon}
              />

              <div className="relative">
                <Button
                  variant="ghost"
                  className="h-9 flex items-center space-x-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <ChevronDownIcon className="h-5 w-5 text-[var(--text-tertiary)]" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg py-1 border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg">
                    <Button
                      variant="ghost"
                      to="/profile"
                      className="w-full text-left px-4 py-2 text-sm justify-start text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      Your Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm justify-start text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      Sign out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>

        <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-sm text-[var(--text-tertiary)]">
              © {new Date().getFullYear()} Bug Tracker
            </div>
            <div className="text-sm text-[var(--text-tertiary)]">
              Version 1.0.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
