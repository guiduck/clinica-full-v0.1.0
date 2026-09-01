import { cookies } from "next/headers";
import type { APIRequest, APIResponse } from "@/types/api";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function API<T = unknown>(request: APIRequest): Promise<APIResponse<T>> {
  const fullUrl = new URL(request.url.replace(/^\/+/, ""), `${getBaseUrl().replace(/\/$/, "")}/`);
  const isFormData = request.data instanceof FormData;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const body: BodyInit | undefined =
      request.method !== "GET" && request.data
        ? isFormData
          ? (request.data as FormData)
          : JSON.stringify(request.data)
        : undefined;

    const response = await fetch(fullUrl, {
      method: request.method,
      next: request.next,
      cache: request.cache,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...request.headers
      },
      body
    });

    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      return {
        status: response.status,
        data: null,
        error: true,
        errorUserMessage: responseData?.message || "Erro desconhecido.",
        headers: response.headers
      };
    }

    return {
      status: response.status,
      data: responseData as T,
      error: false,
      errorUserMessage: "",
      headers: response.headers
    };
  } catch {
    return {
      status: 500,
      data: null,
      error: true,
      errorUserMessage: "Erro no servidor.",
      headers: null
    };
  }
}
