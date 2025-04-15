import { useState } from "react";
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import Card, { CardHeader, CardContent } from "../components/Card";
import Button from "../components/Button";
import ProfileSettings from "../components/settings/ProfileSettings";
import SecuritySettings from "../components/settings/SecuritySettings";

const SETTINGS_MENU = [
  { id: "profile", name: "Profile", icon: UserIcon },
  { id: "notifications", name: "Notifications", icon: BellIcon },
  { id: "security", name: "Security", icon: ShieldCheckIcon },
  { id: "appearance", name: "Appearance", icon: PaintBrushIcon },
  { id: "integrations", name: "Integrations", icon: ArrowPathIcon },
  { id: "devices", name: "Devices", icon: DevicePhoneMobileIcon },
  { id: "language", name: "Language & Region", icon: GlobeAltIcon },
  { id: "api", name: "API Keys", icon: KeyIcon },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="sticky top-20">
            <div className="p-1">
              <h2 className="text-xl font-semibold mb-4 p-2">Settings</h2>
              <nav className="flex flex-col space-y-1">
                {SETTINGS_MENU.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === item.id
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        activeTab === item.id
                          ? "text-primary-500 dark:text-primary-400"
                          : "text-[var(--text-tertiary)]"
                      }`}
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card className="mb-6">
            <CardContent>
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "security" && <SecuritySettings />}
              {activeTab !== "profile" && activeTab !== "security" && (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 dark:bg-primary-900/50 dark:text-primary-300">
                    {(() => {
                      const item = SETTINGS_MENU.find(
                        (item) => item.id === activeTab
                      );
                      const IconComponent = item?.icon;
                      return (
                        IconComponent && <IconComponent className="h-8 w-8" />
                      );
                    })()}
                  </div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                    {SETTINGS_MENU.find((item) => item.id === activeTab)?.name}{" "}
                    Settings
                  </h3>
                  <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                    This feature is currently under development. Check back soon
                    for updates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
