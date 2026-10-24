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
  styleUrl: './bills.component.css',
})
export class BillsPageComponent {
  vm = inject(BudgetService);
  Math = Math;

  get today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get hasBills(): boolean {
    return this.vm.store().bills.length > 0;
  }

  get activeBillCount(): number {
    return this.vm.store().bills.filter((b) => b.isActive).length;
  }

  get inactiveBillCount(): number {
    return this.vm.store().bills.filter((b) => !b.isActive).length;
  }

  isOverdue(b: any): boolean {
    return !!b?.isActive && !!b?.nextOccurrenceDate && String(b.nextOccurrenceDate) < this.today;
  }

  isDueSoon(b: any): boolean {
    if (!b?.isActive || !b?.nextOccurrenceDate) return false;
    const diffDays = Math.round(
      (new Date(String(b.nextOccurrenceDate)).getTime() -
        new Date(this.today + 'T00:00:00').getTime()) /
        86400000,
    );
    return diffDays >= 0 && diffDays <= 7;
  }

  statusLabel(b: any): string {
    if (!b?.isActive) return 'Inactive';
    if (this.isOverdue(b)) return 'Overdue';
    if (this.isDueSoon(b)) return 'Due soon';
    return 'Upcoming';
  }

  statusClass(b: any): string {
    if (!b?.isActive) return 'bg-muted text-muted-foreground';
    if (this.isOverdue(b)) return 'bg-destructive/15 text-destructive';
    if (this.isDueSoon(b)) return 'bg-accent/20 text-accent-foreground';
    return 'bg-primary/15 text-primary';
  }
}
