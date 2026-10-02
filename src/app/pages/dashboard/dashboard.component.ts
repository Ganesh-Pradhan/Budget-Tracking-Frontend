import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";
import { BudgetService } from "../../services/budget.service";

interface SummaryCard {
  l: string;
  v: string;
  n: string;
  tone: string;
  i: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  get summaryCards(): SummaryCard[] {
    return [
      {
        l: "Available to spend",
        v: this.vm.money(this.vm.monthIncome - this.vm.monthExpenses),
        n: "After planned bills",
        tone: "green",
        i: "wallet",
      },
      {
        l: "Income",
        v: this.vm.money(this.vm.monthIncome),
        n: "From API data",
        tone: "default",
        i: "trending-up",
      },
      {
        l: "Spent so far",
        v: this.vm.money(this.vm.monthExpenses),
        n: Math.round(this.vm.monthBudgetPercent) + "% of monthly budget",
        tone: "peach",
        i: "trending-down",
      },
      {
        l: "Across all accounts",
        v: this.vm.compactMoney(this.vm.accountsTotal),
        n: this.vm.accounts.length + " active accounts",
        tone: "navy",
        i: "landmark",
      },
    ];
  }
}
