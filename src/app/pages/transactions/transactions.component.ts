import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { CustomSelectComponent } from '../../components/ui/custom-select/custom-select.component';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomSelectComponent, TooltipDirective],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  search = '';
  typeFilter = 'All';
  categoryFilter = 'All';
  paymentModeFilter = 'All';
  dateFrom = '';
  dateTo = '';

  get hasTransactions(): boolean {
    return this.vm.store().transactions.length > 0;
  }

  get typeFilterOptions(): string[] {
    return ['All', 'Expense', 'Need'];
  }

  get categoryFilterOptions(): string[] {
    return ['All', ...this.vm.categories];
  }

  get paymentModeFilterOptions(): string[] {
    return ['All', ...this.vm.paymentModes];
  }

  get filteredTransactions() {
    const query = this.search.trim().toLowerCase();
    let result = this.vm.store().transactions.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.description,
          item.category,
          item.paymentMode,
          item.transactionType,
          item.transactionDate,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query),
        );
      const matchesType =
        this.typeFilter === 'All' || item.transactionType === this.typeFilter;
      const matchesCategory =
        this.categoryFilter === 'All' || item.category === this.categoryFilter;
      const matchesPaymentMode =
        this.paymentModeFilter === 'All' ||
        item.paymentMode === this.paymentModeFilter;
      const matchesDateFrom =
        !this.dateFrom || item.transactionDate >= this.dateFrom;
      const matchesDateTo = !this.dateTo || item.transactionDate <= this.dateTo;
      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesPaymentMode &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    const col = this.vm.sortColumn();
    const dir = this.vm.sortDirection();
    if (col) {
      result = [...result].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (col === 'date') {
          aVal = new Date(a.transactionDate).getTime();
          bVal = new Date(b.transactionDate).getTime();
        } else if (col === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        }
        if (aVal < bVal) return dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }

  clearFilters() {
    this.search = '';
    this.typeFilter = 'All';
    this.categoryFilter = 'All';
    this.paymentModeFilter = 'All';
    this.dateFrom = '';
    this.dateTo = '';
  }
}
