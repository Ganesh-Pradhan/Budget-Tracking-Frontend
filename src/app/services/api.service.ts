import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ApiService {
  private clean(baseUrl: string): string {
    return baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    baseUrl: string,
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.clean(baseUrl)}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message =
        body?.message || body?.title || `Request failed (${response.status})`;
      throw new Error(
        `${message} [${response.status}] ${this.clean(baseUrl)}${path}`,
      );
    }

    return body as T;
  }

  async testConnection(baseUrl: string): Promise<boolean> {
    if (!baseUrl) return false;
    try {
      const response = await fetch(
        `${this.clean(baseUrl)}/api/dashboard/summary?userId=4`,
        {
          signal: AbortSignal.timeout(2500),
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  get<T>(baseUrl: string, path: string): Promise<T> {
    return this.request<T>(baseUrl, path);
  }
  post<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
    return this.request<T>(baseUrl, path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  put<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
    return this.request<T>(baseUrl, path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
  delete<T>(baseUrl: string, path: string): Promise<T> {
    return this.request<T>(baseUrl, path, { method: "DELETE" });
  }
}
