import { Profile } from "../types/api";
import { request } from "./httpClient";

export const profileApi = {
  getProfile: () => request<Profile>("/profile"),
  updateProfile: (payload: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }) =>
    request<Profile>("/profile", {
      method: "PUT",
      body: payload,
    }),
};

