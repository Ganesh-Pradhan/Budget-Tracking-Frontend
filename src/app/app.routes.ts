import { Routes } from '@angular/router';
import { authGuard, signedInGuard } from './guards/auth.guard';
import { LoginPageComponent } from './pages/login/login.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.component';
import { TransactionsPageComponent } from './pages/transactions/transactions.component';
import { IncomePageComponent } from './pages/income/income.component';
import { ExpensesPageComponent } from './pages/expenses/expenses.component';
import { BudgetPageComponent } from './pages/budget/budget.component';
import { YearlySummaryPageComponent } from './pages/yearly-summary/yearly-summary.component';
import { SavingsGoalsPageComponent } from './pages/savings-goals/savings-goals.component';
import { AccountsPageComponent } from './pages/accounts/accounts.component';
import { BillsPageComponent } from './pages/bills/bills.component';
import { CategoriesPageComponent } from './pages/categories/categories.component';
import { PaymentMethodsPageComponent } from './pages/payment-methods/payment-methods.component';
import { ReportsPageComponent } from './pages/reports/reports.component';
import { SettingsPageComponent } from './pages/settings/settings.component';
import { NotFoundPageComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, canActivate: [signedInGuard] },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsPageComponent, canActivate: [authGuard] },
  { path: 'income', component: IncomePageComponent, canActivate: [authGuard] },
  { path: 'expenses', component: ExpensesPageComponent, canActivate: [authGuard] },
  { path: 'budget', component: BudgetPageComponent, canActivate: [authGuard] },
  { path: 'yearly-summary', component: YearlySummaryPageComponent, canActivate: [authGuard] },
  { path: 'savings-goals', component: SavingsGoalsPageComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsPageComponent, canActivate: [authGuard] },
  { path: 'bills', component: BillsPageComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoriesPageComponent, canActivate: [authGuard] },
  { path: 'payment-methods', component: PaymentMethodsPageComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsPageComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundPageComponent }
];
