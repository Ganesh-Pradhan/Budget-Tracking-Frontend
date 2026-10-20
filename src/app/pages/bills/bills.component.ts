import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipDirective],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsPageComponent {
  vm = inject(BudgetService);
}
