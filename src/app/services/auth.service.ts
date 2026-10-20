import { Injectable, signal } from "@angular/core";

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
}

interface AuthResponseData {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  expiresAt: string;
}

interface AuthResponse {
  message: string;
  data: AuthResponseData;
}

const AUTH_STORAGE_KEY = "budget-tracker-auth-v1";

/**
 * Owns the JWT session for the app. The token and the authenticated user's
 * identity come from the server (login/register responses) — the user id is
 * never hard-coded on the client. Persists the session in localStorage so a
 * page refresh keeps the user signed in.
 *
 * This service intentionally does not inject other app services (it performs
 * its own fetch calls) so that ApiService/StorageService can depend on it
 * without a circular dependency.
 */
@Injectable({ providedIn: "root" })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readStoredSession());

  /** True when a non-expired JWT is available. */
  get isAuthenticated(): boolean {
    return this.token != null;
  }

  /** The JWT for the current session, or null when signed out. */
  get token(): string | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.token || !parsed?.expiresAt) return null;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.logout();
        return null;
      }
      return parsed.token;
    } catch {
      return null;
    }
  }

  /** The authenticated user's id from the server session, or null. */
  get userId(): number | null {
    return this.user()?.userId ?? null;
  }

  async login(
    baseUrl: string,
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const data = await this.postAuth<AuthResponse>(
      baseUrl,
      "/api/auth/login",
      { email, password },
    );
    return this.startSession(data);
  }

  async register(
    baseUrl: string,
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<AuthUser> {
    const data = await this.postAuth<AuthResponse>(
      baseUrl,
      "/api/auth/register",
      { fullName, email, password, confirmPassword },
    );
    return this.startSession(data);
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.user.set(null);
  }

  private startSession(response: AuthResponse): AuthUser {
    const sessionUser: AuthUser = {
      userId: response.data.userId,
      fullName: response.data.fullName,
      email: response.data.email,
    };
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: response.data.token,
        expiresAt: response.data.expiresAt,
        ...sessionUser,
      }),
    );
    this.user.set(sessionUser);
    return sessionUser;
  }

  private readStoredSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.token || !parsed?.userId || !parsed?.expiresAt) return null;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return {
        userId: parsed.userId,
        fullName: parsed.fullName ?? "",
        email: parsed.email ?? "",
      };
    } catch {
      return null;
    }
  }

  private async postAuth<T>(
    baseUrl: string,
    path: string,
    body: unknown,
  ): Promise<T> {
    return this.request<T>(baseUrl, path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /** Persists a new display name to the account and refreshes the session. */
  async updateProfile(baseUrl: string, fullName: string): Promise<AuthUser> {
    const data = await this.request<AuthResponse>(baseUrl, "/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ fullName }),
    });
    return this.startSession(data);
  }

  private async request<T>(
    baseUrl: string,
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const response = await fetch(`${cleanBaseUrl}${path}`, init);

    const text = await response.text();
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      let message =
        parsed?.message ||
        (typeof parsed === "string" && parsed) ||
        `Authentication failed (${response.status})`;

      // ASP.NET ValidationProblemDetails — flatten field errors into one message.
      if (parsed?.errors && typeof parsed.errors === "object") {
        message = Object.values(parsed.errors as Record<string, string[]>)
          .flat()
          .join(" ");
      }

      throw new Error(message);
    }

    return parsed as T;
  }
}