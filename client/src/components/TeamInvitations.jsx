import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  EnvelopeIcon,
  XMarkIcon,
  ArrowPathIcon,
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

export default function TeamInvitations({ teamId }) {
  const queryClient = useQueryClient();
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);

  const {
    data: invitations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team-invitations", teamId],
    queryFn: async () => {
      const { data } = await api.get(`/api/teams/${teamId}/invitations`);
      return data;
    },
    staleTime: 30000, // 30 seconds
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId) => {
      await api.delete(`/api/teams/${teamId}/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team-invitations", teamId]);
      toast.success("Invitation cancelled successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel invitation"
      );
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      // We'll reuse the add member endpoint to resend invitation
      const { data } = await api.post(`/api/teams/${teamId}/members`, {
        email,
        role,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["team-invitations", teamId]);
      setIsResendModalOpen(false);
      setSelectedInvitation(null);
      toast.success("Invitation resent successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to resend invitation"
      );
    },
  });

  const handleCancelInvitation = (invitationId) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      cancelInvitationMutation.mutate(invitationId);
    }
  };

  const handleResendInvitation = () => {
    if (!selectedInvitation) return;

    resendInvitationMutation.mutate({
      email: selectedInvitation.email,
      role: selectedInvitation.role,
    });
  };

  const isExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Invitations
          </h3>
        </div>
        <div className="px-4 py-8 text-center text-gray-500">
          Loading invitations...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Invitations
          </h3>
        </div>
        <div className="px-4 py-8 text-center text-red-500">
          Error loading invitations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Invitations ({invitations?.length || 0})
          </h3>
        </div>

        {invitations && invitations.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-gray-200">
              {invitations.map((invitation) => {
                const expired = isExpired(invitation.expiresAt);
                return (
                  <li key={invitation._id} className="py-4 px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {invitation.email}
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                              {invitation.role}
                            </span>

                            {expired && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Invited on{" "}
                            {format(
                              new Date(invitation.invitedAt),
                              "MMM d, yyyy"
                            )}
                            {!expired && (
                              <>
                                {" • "}
                                Expires on{" "}
                                {format(
                                  new Date(invitation.expiresAt),
                                  "MMM d, yyyy"
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setIsResendModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCancelInvitation(invitation._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            No pending invitations.
          </div>
        )}
      </div>

      {/* Resend Invitation Modal */}
      {isResendModalOpen && selectedInvitation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Resend Invitation
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This will send a new invitation email to{" "}
                  {selectedInvitation.email} with a new expiration date.
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsResendModalOpen(false);
                    setSelectedInvitation(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResendInvitation}
                  disabled={resendInvitationMutation.isLoading}
                  className="btn-primary"
                >
                  {resendInvitationMutation.isLoading
                    ? "Sending..."
                    : "Resend Invitation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
