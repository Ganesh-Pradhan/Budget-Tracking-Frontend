import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";

interface CachedResponse {
  expiresAt: number;
  value: any;
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // In-flight GET requests, keyed by user + endpoint, so concurrent identical
  // reads share one network request instead of duplicating it.
  private readonly inflightGets = new Map<string, Promise<any>>();

  // Short-lived response cache for relatively stable reference data only.
  // Financial lists/totals are never cached here; mutations invalidate this.
  private readonly responseCache = new Map<string, CachedResponse>();

  // Keep reference data fresh enough for normal use while avoiding repeated
  // identical reads during bursts of navigation/refresh.
  private static readonly CACHE_TTL_MS = 15_000;

  private clean(baseUrl: string): string {
    return baseUrl.replace(/\/$/, "");
  }

  private requestKey(baseUrl: string, path: string): string {
    // Include the token so one user's cached/in-flight request can never be
    // reused for another user.
    const token = this.auth.token ?? "";
    return `${token}|${this.clean(baseUrl)}|${path}`;
  }

  private isCacheable(path: string): boolean {
    const normalized = path.split("?")[0].toLowerCase();
    return (
      normalized === "/api/categories" ||
      normalized === "/api/paymentmodes" ||
      normalized === "/api/incomesources"
    );
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
      this.clearCache();
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

  /** Removes all cached and in-flight GET state (used on logout/user change). */
  clearCache(): void {
    this.inflightGets.clear();
    this.responseCache.clear();
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
    const key = this.requestKey(baseUrl, path);

    const cached = this.responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.value as T);
    }
    if (cached) {
      this.responseCache.delete(key);
    }

    const existing = this.inflightGets.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const requestPromise = this.request<T>(baseUrl, path)
      .then((value) => {
        if (this.isCacheable(path)) {
          this.responseCache.set(key, {
            expiresAt: Date.now() + ApiService.CACHE_TTL_MS,
            value,
          });
        }
        return value;
      })
      .finally(() => {
        this.inflightGets.delete(key);
      });

    this.inflightGets.set(key, requestPromise);
    return requestPromise;
  }

  async post<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
    const result = await this.request<T>(baseUrl, path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    this.clearCache();
    return result;
  }

  async put<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
    const result = await this.request<T>(baseUrl, path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    this.clearCache();
    return result;
  }

  async delete<T>(baseUrl: string, path: string): Promise<T> {
    const result = await this.request<T>(baseUrl, path, { method: "DELETE" });
    this.clearCache();
    return result;
  }
}
