import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';
import { CustomSelectComponent } from '../../components/ui/custom-select/custom-select.component';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TooltipDirective, CustomSelectComponent],
  templateUrl: './income.component.html',
  styleUrl: './income.component.css',
})
export class IncomePageComponent {
  vm = inject(BudgetService);
  Math = Math;

  search = '';
  sourceFilter = 'All';

  get hasIncomes(): boolean {
    return this.vm.store().incomes.length > 0;
  }

  get sourceFilterOptions(): string[] {
    return ['All', ...this.vm.apiIncomeSources.map((source) => source.name)];
  }

  get filteredIncomes() {
    const query = this.search.trim().toLowerCase();
    return this.vm.sortedIncomes.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.description,
          item.source,
          item.account,
          item.incomeDate,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query),
        );
      const matchesSource =
        this.sourceFilter === 'All' || item.source === this.sourceFilter;
      return matchesSearch && matchesSource;
    });
  }

  clearFilters() {
    this.search = '';
    this.sourceFilter = 'All';
  }
}
