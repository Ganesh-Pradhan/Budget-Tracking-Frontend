import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard.component';
import { TransactionsPageComponent } from './pages/transactions/transactions.component';
import { IncomePageComponent } from './pages/income/income.component';
import { ExpensesPageComponent } from './pages/expenses/expenses.component';
import { BudgetPageComponent } from './pages/budget/budget.component';
import { YearlySummaryPageComponent } from './pages/yearly-summary/yearly-summary.component';
import { SavingsGoalsPageComponent } from './pages/savings-goals/savings-goals.component';
import { AccountsPageComponent } from './pages/accounts/accounts.component';
import { BillsPageComponent } from './pages/bills/bills.component';
import { ReportsPageComponent } from './pages/reports/reports.component';
import { SettingsPageComponent } from './pages/settings/settings.component';
import { NotFoundPageComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'transactions', component: TransactionsPageComponent },
  { path: 'income', component: IncomePageComponent },
  { path: 'expenses', component: ExpensesPageComponent },
  { path: 'budget', component: BudgetPageComponent },
  { path: 'yearly-summary', component: YearlySummaryPageComponent },
  { path: 'savings-goals', component: SavingsGoalsPageComponent },
  { path: 'accounts', component: AccountsPageComponent },
  { path: 'bills', component: BillsPageComponent },
  { path: 'reports', component: ReportsPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: '**', component: NotFoundPageComponent }
];
