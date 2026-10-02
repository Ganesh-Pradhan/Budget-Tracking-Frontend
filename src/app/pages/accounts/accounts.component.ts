import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsPageComponent {
  vm = inject(BudgetService);
}
