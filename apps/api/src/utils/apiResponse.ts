import { ApiSuccessResponse } from "@repo/types";

export function apiResponse<T>(
  data: T,
  message = "Success",
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
