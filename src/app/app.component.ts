import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";
import { BudgetService } from "./services/budget.service";
import { ConfirmService } from "./services/confirm.service";
import { AuthService } from "./services/auth.service";
import { NavItem } from "./models";
import { CustomSelectComponent } from "./components/ui/custom-select/custom-select.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterOutlet,
    CustomSelectComponent,
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  Math = Math;

  vm = inject(BudgetService);
  confirm = inject(ConfirmService);
  private auth = inject(AuthService);

  overviewItems: NavItem[] = [
    { p: "dashboard", l: "Dashboard", i: "house" },
    { p: "transactions", l: "Transactions", i: "activity" },
  ];

  planItems: NavItem[] = [
    { p: "income", l: "Income", i: "arrow-up-right" },
    { p: "expenses", l: "Expenses", i: "arrow-down-left" },
    { p: "budget", l: "Budget", i: "layout-grid" },
    { p: "savings-goals", l: "Savings goals", i: "target" },
  ];

  organizeItems: NavItem[] = [
    { p: "accounts", l: "Accounts", i: "landmark" },
    { p: "bills", l: "Recurring bills", i: "receipt-text" },
    { p: "yearly-summary", l: "Yearly summary", i: "bar-chart-3" },
    { p: "reports", l: "Reports", i: "file-text" },
  ];

  // Sidebar collapse state
  sidebarCollapsed = signal(false);

  // Profile dropdown (sidebar footer / topbar avatar)
  profileDropdown = signal(false);

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.url.subscribe(() => {
      this.vm.mobileOpen.set(false);
    });

    await this.vm.init();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  closeDropdownOnBackdrop(): void {
    this.profileDropdown.set(false);
  }

  /** Displayed name of the signed-in user (from the server session). */
  get userName(): string {
    return (
      this.auth.user()?.fullName?.trim() ||
      this.vm.settings().name?.trim() ||
      "User"
    );
  }

  /** Email of the signed-in user, or empty when signed out. */
  get userEmail(): string {
    return this.auth.user()?.email ?? "";
  }

  getInitials(name?: string): string {
    if (!name) return "";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  }
}