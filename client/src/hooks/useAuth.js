import { create } from "zustand";
import apiClient from "../api/api";

export const useAuth = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const { data } = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });
      const { data } = await apiClient.post("/api/auth/register", userData);
      localStorage.setItem("token", data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      set({ isLoading: true });
      const { data } = await apiClient.get("/api/auth/profile");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ isLoading: true });
      const { data } = await apiClient.patch("/api/auth/profile", updates);
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },
}));
