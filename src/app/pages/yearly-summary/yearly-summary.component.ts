import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';

interface SummaryStat {
  l: string;
  v: string;
  i: string;
}

@Component({
  selector: 'app-yearly-summary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './yearly-summary.component.html',
  styleUrl: './yearly-summary.component.css'
})
export class YearlySummaryPageComponent {
  vm = inject(BudgetService);

  get summaryStats(): SummaryStat[] {
    return [
      { l: 'Income', v: this.vm.money(this.vm.totalIncome()), i: 'trending-up' },
      { l: 'Expenses', v: this.vm.money(this.vm.totalExpenses()), i: 'trending-down' },
      { l: 'Net', v: this.vm.money(this.vm.totalIncome() - this.vm.totalExpenses()), i: 'wallet' }
    ];
  }
}
