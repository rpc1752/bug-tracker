import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
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

export default function JoinTeam() {
  const { teamId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [teamName, setTeamName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/api/teams/join/${teamId}/${token}`);
      return data;
    },
    onSuccess: (data) => {
      setStatus("success");
      setTeamName(data.team?.name || "the team");
      toast.success("You have successfully joined the team");
      // Redirect to team page after 3 seconds
      setTimeout(() => {
        navigate(`/teams/${teamId}`);
      }, 3000);
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.response?.data?.message || "Failed to join team");
      toast.error(error.response?.data?.message || "Failed to join team");
    },
  });

  useEffect(() => {
    // Verify the user is authenticated first
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login page with a return URL
      navigate(`/login?redirect=/teams/join/${teamId}/${token}`);
      return;
    }

    // Accept the invitation automatically
    acceptInvitationMutation.mutate();
  }, [teamId, token, navigate, acceptInvitationMutation]);

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <UserGroupIcon className="h-12 w-12 text-primary-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Team Invitation
          </h2>

          {status === "loading" && (
            <div className="mt-4 text-gray-600">
              <p>Processing your invitation...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="mt-4 text-gray-600">
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
              <p className="mb-2">
                You have successfully joined <strong>{teamName}</strong>!
              </p>
              <p className="text-sm">
                You will be redirected to the team page in a moment...
              </p>
              <div className="mt-6">
                <Link
                  to={`/teams/${teamId}`}
                  className="btn-primary inline-block"
                >
                  Go to Team Page
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 text-gray-600">
              <div className="flex justify-center mb-4">
                <XCircleIcon className="h-12 w-12 text-red-500" />
              </div>
              <p className="mb-2">
                <strong>Unable to join team</strong>
              </p>
              <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
              <div className="mt-6 flex space-x-4 justify-center">
                <Link to="/teams" className="btn-secondary inline-block">
                  View All Teams
                </Link>
                <Link to="/" className="btn-primary inline-block">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
