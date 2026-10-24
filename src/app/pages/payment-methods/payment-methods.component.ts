import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TooltipDirective],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.css',
})
export class PaymentMethodsPageComponent {
  vm = inject(BudgetService);

  search = '';

  get records(): any[] {
    return this.vm.apiPaymentModeRecords || [];
  }

  get filtered(): any[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.records;
    return this.records.filter(
      (p) =>
        String(p?.modeName || '').toLowerCase().includes(term) ||
        String(p?.description || '').toLowerCase().includes(term),
    );
  }

  get hasMethods(): boolean {
    return this.records.length > 0;
  }

  get hasVisible(): boolean {
    return this.filtered.length > 0;
  }
}
