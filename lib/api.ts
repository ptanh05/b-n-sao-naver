export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL || (window as any).NEXT_PUBLIC_API_URL
    if (fromEnv) return fromEnv as string
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
}

const baseUrl = getBaseUrl()

interface RequestOptions<TBody> {
  path: string
  method?: HttpMethod
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function request<TResponse, TBody = unknown>({ path, method = "GET", body, headers, signal }: RequestOptions<TBody>): Promise<TResponse> {
  const url = `${baseUrl}${path}`

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`
    try {
      const data = isJson ? await res.json() : await res.text()
      errorMessage = typeof data === "string" ? data : (data?.message || JSON.stringify(data))
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }

  if (res.status === 204) {
    return undefined as unknown as TResponse
  }

  return (isJson ? await res.json() : (await res.text())) as TResponse
}

export const api = {
  get: <TResponse>(path: string, opts?: Omit<RequestOptions<never>, "path" | "method" | "body">) =>
    request<TResponse>({ path, method: "GET", ...(opts || {}) }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, opts?: Omit<RequestOptions<TBody>, "path" | "method" | "body">) =>
    request<TResponse, TBody>({ path, method: "POST", body, ...(opts || {}) }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, opts?: Omit<RequestOptions<TBody>, "path" | "method" | "body">) =>
    request<TResponse, TBody>({ path, method: "PUT", body, ...(opts || {}) }),
  delete: <TResponse>(path: string, opts?: Omit<RequestOptions<never>, "path" | "method" | "body">) =>
    request<TResponse>({ path, method: "DELETE", ...(opts || {}) }),
}

export const endpoints = {
  // Auth
  me: "/auth/me",
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  // Tasks
  tasks: "/tasks",
  task: (id: string) => `/tasks/${id}`,
  tasksExport: "/tasks/export",
  tasksImport: "/tasks/import",
}
