import axios from "axios";
import { User, Interview, GoogleMeet } from "../types";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userService = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: User) => api.post<User>("/users", user),
  update: (id: number, user: User) => api.put<User>(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const interviewService = {
  getAll: () => api.get<Interview[]>("/interviews"),
  getById: (id: number) => api.get<Interview>(`/interviews/${id}`),
  create: (interview: Interview) =>
    api.post<Interview>("/interviews", interview),
  update: (id: number, interview: Interview) =>
    api.put<Interview>(`/interviews/${id}`, interview),
  delete: (id: number) => api.delete(`/interviews/${id}`),
  scheduleRandomPair: (
    title: string,
    description: string,
    scheduledTime: string
  ) =>
    api.post<Interview>("/google-meet/schedule-random-pair", null, {
      params: {
        title,
        description,
        scheduledTime,
      },
    }),
};

export const googleMeetService = {
  getByInterviewId: (interviewId: number) =>
    api.get<GoogleMeet>(`/google-meet/interview/${interviewId}`),
  checkAuthStatus: () => api.get<string>("/google-meet/auth-status"),
};
