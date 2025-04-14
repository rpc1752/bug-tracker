import { useState } from "react";
import Button from "../Button";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function ProfileSettings({ user = {} }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    jobTitle: user.jobTitle || "",
    bio: user.bio || "",
    timezone: user.timezone || "UTC",
  });

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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={formData.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
            )}
          </div>
        </div>
        <div className="ml-6">
          <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          <div className="mt-2 flex space-x-3">
            <Button variant="secondary" size="sm">
              Change
            </Button>
            <Button variant="outline" size="sm">
              Remove
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 input"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 input"
            />
          </div>

          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="mt-1 input"
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700"
            >
              Timezone
            </label>
            <select
              name="timezone"
              id="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="mt-1 input"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="Brief description about yourself"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" className="mr-3">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
