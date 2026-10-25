import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private clean(baseUrl: string): string {
    return baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    baseUrl: string,
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.auth.token;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.clean(baseUrl)}${path}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (response.status === 401 && token) {
      // The JWT is missing, malformed or expired — end the local session so
      // the auth guard can redirect to the login page on the next navigation.
      this.auth.logout();
      const currentPath = this.router.url.split("?")[0];
      if (currentPath !== "/login" && currentPath !== "/signup") {
        this.router.navigate(["/login"]);
      }
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
      // Anonymous liveness probe — deliberately not a data endpoint.
      const response = await fetch(`${this.clean(baseUrl)}/api/health`, {
        signal: AbortSignal.timeout(2500),
      });
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
