import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { AuthService } from "../../services/auth.service";
import { BudgetService } from "../../services/budget.service";
import { StorageService } from "../../services/storage.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly budget = inject(BudgetService);
  private readonly router = inject(Router);

  readonly storage = inject(StorageService);

  mode = signal<"login" | "register">("login");
  loading = signal(false);
  error = signal("");

  fullName = "";
  email = "";
  password = "";
  confirmPassword = "";

  async submit() {
    const validationError = this.validate();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    this.loading.set(true);
    this.error.set("");

    try {
      const baseUrl = this.storage.settings().apiBaseUrl;

      if (this.mode() === "login") {
        await this.auth.login(baseUrl, this.email.trim(), this.password);
      } else {
        await this.auth.register(
          baseUrl,
          this.fullName.trim(),
          this.email.trim(),
          this.password,
          this.confirmPassword,
        );
      }

      // Pull the signed-in user's data, then land on the dashboard.
      await this.budget.reload();
      await this.router.navigate(["/dashboard"]);
    } catch (err: any) {
      this.error.set(err?.message || "Something went wrong. Please try again.");
      this.loading.set(false);
    }
  }

  private validate(): string {
    const email = this.email.trim();
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (!this.password) return "Password is required.";
    if (this.password.length < 6)
      return "Password must be at least 6 characters.";

    if (this.mode() === "register") {
      if (!this.fullName.trim()) return "Full name is required.";
      if (this.password !== this.confirmPassword)
        return "Password and confirmation password do not match.";
    }

    return "";
  }
}