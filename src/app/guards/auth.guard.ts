import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

/**
 * Redirects anonymous visitors to the login page. Every data endpoint on the
 * API requires a valid JWT, so the app shell is only reachable when signed in.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated ? true : router.createUrlTree(["/login"]);
};

/**
 * Keeps already signed-in users off the login page — they are bounced to the
 * dashboard instead so they never see the sign-in form with a live session.
 */
export const signedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated ? router.createUrlTree(["/dashboard"]) : true;
};