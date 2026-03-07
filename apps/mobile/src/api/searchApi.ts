import { SearchResult } from "../types/api";
import { request } from "./httpClient";

export const searchApi = {
  searchDocuments: (query: string) =>
    request<SearchResult[]>(`/search?q=${encodeURIComponent(query.trim())}`),
};

