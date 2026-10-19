import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsPageComponent implements OnInit {
  vm = inject(BudgetService);

  reportPeriods: string[] = ['Monthly', 'Yearly', 'Categories'];

  ngOnInit() {
    this.vm.setReportPeriod('Monthly');
  }
}
