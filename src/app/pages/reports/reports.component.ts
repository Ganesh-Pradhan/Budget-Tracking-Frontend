import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsPageComponent implements OnInit {
  vm = inject(BudgetService);

  reportPeriods: string[] = ['Monthly', 'Yearly', 'Categories'];

  ngOnInit() {
    this.vm.setReportPeriod('Monthly');
  }

  get reportTotalIncome() {
    return this.vm.reportChartItems.reduce(
      (sum, item) => sum + (Number(item.income) || 0),
      0,
    );
  }

  get reportTotalExpense() {
    return this.vm.reportChartItems.reduce(
      (sum, item) => sum + (Number(item.expense) || 0),
      0,
    );
  }

  get reportNet() {
    return this.reportTotalIncome - this.reportTotalExpense;
  }
}
