import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";
import { BudgetService } from "../../services/budget.service";
import { CustomSelectComponent } from "../../components/ui/custom-select/custom-select.component";
import { TooltipDirective } from "../../components/ui/tooltip/tooltip.directive";

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
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomSelectComponent, TooltipDirective],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardPageComponent implements OnInit {
  vm = inject(BudgetService);
  Math = Math;

  async ngOnInit() {
    await this.vm.normalizeMonth();
  }



  get monthOptions() {
    return this.vm.months.map((m) => ({
      label: this.vm.monthLabel(m),
      value: m,
      disabled: this.vm.isFutureMonth(m),
    }));
  }

  get summaryCards(): SummaryCard[] {
    const net = this.vm.monthIncome - this.vm.monthExpenses;
    return [
      {
        l: "Net this month",
        v: this.vm.money(net),
        n: "Income minus expenses",
        tone: net >= 0 ? "green" : "peach",
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
        n:
          Math.round(this.rawBudgetPercent) +
          "% of monthly budget",
        tone: this.vm.monthBudgetPercent > 100 ? "peach" : "peach",
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

  get hasDailyBars(): boolean {
    return this.vm.monthDailyBars.some((h) => h > 0);
  }

  get hasCategorySpend(): boolean {
    return this.vm.categoriesSpend.length > 0;
  }

  get budgetExceeded(): boolean {
    return (
      this.vm.budgetAmount() > 0 &&
      this.vm.monthExpenses > this.vm.budgetAmount()
    );
  }

  get budgetOverAmount(): number {
    return Math.max(0, this.vm.monthExpenses - this.vm.budgetAmount());
  }

  get rawBudgetPercent(): number {
    return this.vm.budgetAmount() > 0
      ? (this.vm.monthExpenses / this.vm.budgetAmount()) * 100
      : 0;
  }
}
