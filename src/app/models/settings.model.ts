export interface Settings {
  name: string;
  currency: string;
  notifications: boolean;
  theme: "light" | "dark";
  /** Selected accent dot in the profile dropdown (cosmetic). */
  color: string;
  apiBaseUrl: string;
}
