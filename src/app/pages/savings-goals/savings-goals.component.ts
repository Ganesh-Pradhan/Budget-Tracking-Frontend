import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './savings-goals.component.html',
  styleUrl: './savings-goals.component.css'
})
export class SavingsGoalsPageComponent {
  vm = inject(BudgetService);
  Math = Math;
}
