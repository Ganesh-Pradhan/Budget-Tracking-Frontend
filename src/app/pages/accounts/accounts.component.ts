import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipDirective],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsPageComponent {
  vm = inject(BudgetService);
}
