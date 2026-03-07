import { Reminder } from "../types/api";
import { request } from "./httpClient";

export const reminderApi = {
  getReminders: () => request<Reminder[]>("/reminder"),
  createReminder: (documentId: string, reminderDateIso: string) =>
    request<Reminder>("/reminder", {
      method: "POST",
      body: {
        documentId,
        reminderDate: reminderDateIso,
      },
    }),
  dismissReminder: (reminderId: string) =>
    request<null>(`/reminder/${reminderId}/dismiss`, {
      method: "PATCH",
    }),
};

