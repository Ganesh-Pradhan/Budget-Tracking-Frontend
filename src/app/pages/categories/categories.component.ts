import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TooltipDirective, DatePipe],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  search = '';
  typeFilter = 'All';

  get records(): any[] {
    return this.vm.apiCategoryRecords || [];
  }

  get filtered(): any[] {
    const term = this.search.trim().toLowerCase();
    return this.records.filter((c) => {
      const matchesType =
        this.typeFilter === 'All' || c?.categoryType === this.typeFilter;
      const matchesSearch =
        !term ||
        String(c?.categoryName || '').toLowerCase().includes(term) ||
        String(c?.icon || '').toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }

  get hasCategories(): boolean {
    return this.records.length > 0;
  }

  get hasVisible(): boolean {
    return this.filtered.length > 0;
  }

  typeClass(type: string): string {
    return type === 'Income'
      ? 'bg-primary/15 text-primary'
      : 'bg-accent/20 text-accent-foreground';
  }

  iconFor(c: any): string {
    return c?.icon?.trim() || 'tag';
  }
}
