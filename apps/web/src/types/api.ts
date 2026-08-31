export type ApiMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export type APIRequest = {
  url: string;
  method: ApiMethod;
  headers?: Record<string, string>;
  data?: unknown;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
};

export interface APIResponse<T> {
  data: T | null;
  error: boolean;
  errorUserMessage: string;
  debug?: unknown;
  status: number;
  headers?: Headers | null;
}

export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: UserDTO;
};
