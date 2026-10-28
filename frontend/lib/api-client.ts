const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(public status: number, public message: string, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cineforge_access_token");
}

export function setStoredTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cineforge_access_token", access);
  localStorage.setItem("cineforge_refresh_token", refresh);
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cineforge_access_token");
  localStorage.removeItem("cineforge_refresh_token");
}

export function getAssetRawStreamUrl(storageKey: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  return `${base}/assets/raw/${storageKey.replace(/^\/+/, "")}`;
}

export function getVideoAssetUrl(ownerId: string, generationId: string): string {
  return getAssetRawStreamUrl(`users/${ownerId}/videos/${generationId}.mp4`);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = "An unexpected error occurred.";
    let details = null;
    try {
      const errJson = await res.json();
      errMsg = errJson.message || errJson.detail || errMsg;
      details = errJson.details || null;
    } catch {
      errMsg = await res.text();
    }
    throw new ApiError(res.status, errMsg, details);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Authentication
  auth: {
    register: (data: { email: string; password: string; display_name: string }) =>
      request<{ access_token: string; refresh_token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () =>
      request<{ id: string; email: string; display_name: string; role: string }>("/auth/me"),
    logout: () => {
      const refresh = typeof window !== "undefined" ? localStorage.getItem("cineforge_refresh_token") : null;
      clearStoredTokens();
      if (refresh) {
        return request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refresh }),
        }).catch(() => {});
      }
      return Promise.resolve();
    },
  },

  // Projects
  projects: {
    list: (skip = 0, limit = 50) =>
      request<{ items: any[]; total: number }>(`/projects?skip=${skip}&limit=${limit}`),
    create: (data: { title: string; description?: string }) =>
      request<any>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string) => request<any>(`/projects/${id}`),
    update: (id: string, data: any) =>
      request<any>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/projects/${id}`, {
        method: "DELETE",
      }),
  },

  // Video Generations
  generations: {
    list: (projectId?: string, status?: string) => {
      let q = "/generations?";
      if (projectId) q += `project_id=${projectId}&`;
      if (status) q += `status=${status}&`;
      return request<{ items: any[]; total: number }>(q);
    },
    create: (data: {
      project_id: string;
      prompt: string;
      negative_prompt?: string;
      generation_type?: string;
      provider_name?: string;
      provider_model_id?: string;
      input_asset_id?: string;
      idempotency_key?: string;
      parameters?: any;
    }) =>
      request<any>("/generations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string) => request<any>(`/generations/${id}`),
    cancel: (id: string) =>
      request<any>(`/generations/${id}/cancel`, {
        method: "POST",
      }),
  },

  // Media Assets
  assets: {
    upload: (file: File, projectId?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("project_id", projectId);
      return request<any>("/assets/upload", {
        method: "POST",
        body: formData,
      });
    },
    list: (projectId?: string) =>
      request<{ items: any[]; total: number }>(
        projectId ? `/assets?project_id=${projectId}` : "/assets"
      ),
    get: (id: string) => request<any>(`/assets/${id}`),
    getDownloadUrl: (id: string) => request<{ download_url: string }>(`/assets/${id}/download`),
  },

  // Usage & Pricing
  usage: {
    getSummary: () => request<any>("/usage/summary"),
    getEstimate: (provider: string, model: string, duration: number, resolution = "720p") =>
      request<any>(
        `/usage/estimate?provider_name=${provider}&model_id=${model}&duration_seconds=${duration}&resolution=${resolution}`
      ),
  },

  // Providers & Capabilities
  providers: {
    list: () => request<{ providers: any[]; default_provider: string }>("/providers"),
    getCapabilities: (providerName: string) =>
      request<any>(`/providers/${providerName}/capabilities`),
  },

  // Admin Control Plane
  admin: {
    getOverview: () =>
      request<{
        total_users: number;
        total_generations: number;
        total_billed_usd: number;
        system_status: string;
      }>("/admin/overview"),
  },

  // Prompt Intelligence & Storyboards
  prompt: {
    enhance: (prompt: string, style = "cinematic") =>
      request<{
        original_prompt: string;
        enhanced_prompt: string;
        detected_language: string;
        elements: Record<string, string>;
        suggestions: string[];
      }>("/prompt/enhance", {
        method: "POST",
        body: JSON.stringify({ prompt, target_style: style }),
      }),
    storyboard: (script: string, numScenes = 3) =>
      request<{
        script_summary: string;
        scenes: Array<{
          scene_number: number;
          title: string;
          visual_prompt: string;
          duration_seconds: number;
          camera_direction: string;
          lighting: string;
          narration?: string;
        }>;
      }>("/prompt/storyboard", {
        method: "POST",
        body: JSON.stringify({ script, num_scenes: numScenes }),
      }),
  },
};

