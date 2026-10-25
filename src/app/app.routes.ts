import { Routes } from '@angular/router';
import { authGuard, signedInGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginPageComponent), canActivate: [signedInGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardPageComponent), canActivate: [authGuard] },
  { path: 'transactions', loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsPageComponent), canActivate: [authGuard] },
  { path: 'income', loadComponent: () => import('./pages/income/income.component').then(m => m.IncomePageComponent), canActivate: [authGuard] },
  { path: 'expenses', loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesPageComponent), canActivate: [authGuard] },
  { path: 'budget', loadComponent: () => import('./pages/budget/budget.component').then(m => m.BudgetPageComponent), canActivate: [authGuard] },
  { path: 'yearly-summary', loadComponent: () => import('./pages/yearly-summary/yearly-summary.component').then(m => m.YearlySummaryPageComponent), canActivate: [authGuard] },
  { path: 'savings-goals', loadComponent: () => import('./pages/savings-goals/savings-goals.component').then(m => m.SavingsGoalsPageComponent), canActivate: [authGuard] },
  { path: 'accounts', loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsPageComponent), canActivate: [authGuard] },
  { path: 'bills', loadComponent: () => import('./pages/bills/bills.component').then(m => m.BillsPageComponent), canActivate: [authGuard] },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesPageComponent), canActivate: [authGuard] },
  { path: 'payment-methods', loadComponent: () => import('./pages/payment-methods/payment-methods.component').then(m => m.PaymentMethodsPageComponent), canActivate: [authGuard] },
  { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsPageComponent), canActivate: [authGuard] },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsPageComponent), canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundPageComponent) }
];
