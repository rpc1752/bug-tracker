import { useState } from "react";
import Button from "../Button";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginNotifications, setLoginNotifications] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would update the password
    console.log("Password data to save:", formData);
  };

  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="mt-1 input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 input"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Two Factor Authentication */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add an extra layer of security to your account by requiring both
              your password and a verification code.
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
            className={`${
              twoFactorEnabled ? "bg-primary-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Enable two-factor authentication</span>
            <span
              className={`${
                twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Two-factor authentication is enabled. You will receive a
              verification code via email when you log in.
            </p>
          </div>
        )}
      </div>

      {/* Session Timeout */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Session Timeout
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select how long until your session automatically expires due to
          inactivity.
        </p>

        <div className="flex items-center space-x-4">
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(Number(e.target.value))}
            className="input w-auto"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={240}>4 hours</option>
          </select>

          <Button variant="secondary" size="sm">
            Apply
          </Button>
        </div>
      </div>

      {/* Login Notifications */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Login Notifications
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Receive an email notification when your account is logged into
              from a new device or location.
            </p>
          </div>
          <Switch
            checked={loginNotifications}
            onChange={setLoginNotifications}
            className={`${
              loginNotifications ? "bg-primary-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Enable login notifications</span>
            <span
              className={`${
                loginNotifications ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {/* Security Tips */}
      <div className="border-t border-gray-200 pt-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldExclamationIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Recommendations
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Use a strong, unique password for this account</li>
                  <li>
                    Enable two-factor authentication for increased security
                  </li>
                  <li>Don't share your account credentials with others</li>
                  <li>Always log out when using shared computers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
