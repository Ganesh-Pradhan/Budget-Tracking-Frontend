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
  styleUrl: './transactions.component.css'
})
export class TransactionsPageComponent {
  vm = inject(BudgetService);

  get filterModeOptions() {
    return ['All', ...this.vm.paymentModes];
  }
}
