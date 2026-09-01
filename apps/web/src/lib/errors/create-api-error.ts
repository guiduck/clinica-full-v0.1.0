import type { APIResponse } from "@/types/api";

export function createAPIError<T = never>(
  message: string,
  status = 400
): APIResponse<T> {
  return {
    status,
    data: null,
    error: true,
    errorUserMessage: message,
    headers: null
  };
}
