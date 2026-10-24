import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';
import { CustomSelectComponent } from '../../components/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TooltipDirective, CustomSelectComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  search = '';
  categoryFilter = 'All';

  get hasExpenses(): boolean {
    return this.vm.store().expenses.length > 0;
  }

  get categoryFilterOptions(): string[] {
    return ['All', ...this.vm.categories];
  }

  get filteredExpenses() {
    const query = this.search.trim().toLowerCase();
    return this.vm.sortedExpenses.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.description,
          item.category,
          item.account,
          item.paymentMode,
          item.expenseDate,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query),
        );
      const matchesCategory =
        this.categoryFilter === 'All' || item.category === this.categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  clearFilters() {
    this.search = '';
    this.categoryFilter = 'All';
  }
}
