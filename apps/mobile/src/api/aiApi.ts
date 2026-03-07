import { request } from "./httpClient";

export const aiApi = {
  askAssistant: async (query: string) => {
    const response = await request<{ answer: string }>("/ai/chat", {
      method: "POST",
      body: { query },
    });

    return response.answer;
  },
};

