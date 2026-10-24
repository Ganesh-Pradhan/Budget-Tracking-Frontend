import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';
import { TooltipDirective } from '../../components/ui/tooltip/tooltip.directive';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TooltipDirective],
  templateUrl: './savings-goals.component.html',
  styleUrl: './savings-goals.component.css',
})
export class SavingsGoalsPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  get today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get hasGoals(): boolean {
    return this.vm.store().goals.length > 0;
  }

  private number(value: any): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  target(g: any): number {
    return Math.max(0, this.number(g?.targetAmount ?? g?.TargetAmount));
  }

  saved(g: any): number {
    return Math.max(0, this.number(g?.savedAmount ?? g?.SavedAmount));
  }

  remaining(g: any): number {
    return Math.max(0, this.target(g) - this.saved(g));
  }

  progress(g: any): number {
    const target = this.target(g);
    if (target <= 0) return 0;
    return Math.min(100, Math.max(0, (this.saved(g) / target) * 100));
  }

  isComplete(g: any): boolean {
    const target = this.target(g);
    return target > 0 && this.saved(g) >= target;
  }

  isOverdue(g: any): boolean {
    return (
      !this.isComplete(g) &&
      !!g?.targetDate &&
      String(g.targetDate) < this.today
    );
  }

  statusLabel(g: any): string {
    if (this.isComplete(g)) return 'Completed';
    if (this.isOverdue(g)) return 'Overdue';
    return g?.targetDate ? 'In progress' : 'No deadline';
  }

  statusClass(g: any): string {
    if (this.isComplete(g)) return 'bg-primary/15 text-primary';
    if (this.isOverdue(g)) return 'bg-destructive/15 text-destructive';
    return 'bg-secondary text-secondary-foreground';
  }
}
