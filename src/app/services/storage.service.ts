import { Injectable, signal } from "@angular/core";
import {
  emptyStore,
  Settings,
  Store,
  Transaction,
  Income,
  Expense,
  Goal,
  Account,
  Bill,
} from "../models";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class StorageService {
  readonly store = signal<Store>(this.loadStore());
  readonly settings = signal<Settings>(this.loadSettings());
  readonly loading = signal(false);
  readonly online = signal(false);
  readonly categoryOptions = signal<{ id: number; name: string }[]>([]);
  readonly paymentModeOptions = signal<{ id: number; name: string }[]>([]);
  readonly incomeSourceOptions = signal<{ id: number; name: string }[]>([]);

  private readonly settingsKey = "budget-tracker-settings-v1";
  private readonly userId = 4;

  constructor(private api: ApiService) {}

  private loadStore(): Store {
    return emptyStore();
  }

  private loadSettings(): Settings {
    const defaults: Settings = {
      name: "Ganesh",
      currency: "INR",
      notifications: true,
      theme: "light",
      apiBaseUrl: "http://localhost:5264",
    };
    try {
      return {
        ...defaults,
        ...JSON.parse(localStorage.getItem(this.settingsKey) || "{}"),
      };
    } catch {
      return defaults;
    }
  }

  get currentUserId(): number {
    return this.userId;
  }

  updateStore(store: Store) {
    this.store.set(store);
  }

  updateSettings(patch: Partial<Settings>) {
    const next = { ...this.settings(), ...patch };
    this.settings.set(next);
    localStorage.setItem(this.settingsKey, JSON.stringify(next));
    document.documentElement.classList.toggle("dark", next.theme === "dark");
  }

  reset() {
    this.updateStore(emptyStore());
  }

  async syncFromApi(): Promise<boolean> {
    const baseUrl = this.settings().apiBaseUrl;
    if (!baseUrl) return false;

    this.loading.set(true);
    try {
      const [
        transactions,
        incomes,
        expenses,
        goals,
        accounts,
        bills,
        categories,
        paymentModes,
        incomeSources,
      ] = await Promise.all([
        this.getAllPages(baseUrl, `/api/transactions?userId=${this.userId}`),
        this.getAllPages(baseUrl, `/api/incomes?userId=${this.userId}`),
        this.getAllPages(baseUrl, `/api/expenses?userId=${this.userId}`),
        this.getAllPages(baseUrl, `/api/savingsgoals?userId=${this.userId}`),
        this.getAllPages(baseUrl, `/api/accounts?userId=${this.userId}`),
        this.getAllPages(
          baseUrl,
          `/api/recurringtransactions?userId=${this.userId}`,
        ),
        this.api.get<any>(baseUrl, `/api/categories`),
        this.api.get<any>(baseUrl, `/api/paymentmodes`),
        this.api.get<any>(baseUrl, `/api/incomesources`),
      ]);

      const accountRows = this.rows(accounts);
      const categoryRows = this.rows(categories);
      const paymentRows = this.rows(paymentModes);
      const sourceRows = this.rows(incomeSources);

      const accountById = new Map(
        accountRows.map((x: any) => [x.accountId, x]),
      );
      const categoryById = new Map(
        categoryRows.map((x: any) => [x.categoryId, x]),
      );
      const paymentById = new Map(
        paymentRows.map((x: any) => [x.paymentModeId, x]),
      );
      const sourceById = new Map(sourceRows.map((x: any) => [x.sourceId, x]));
      this.categoryOptions.set(
        categoryRows
          .filter((x: any) => x.isActive)
          .map((x: any) => ({ id: x.categoryId, name: x.categoryName })),
      );
      this.paymentModeOptions.set(
        paymentRows
          .filter((x: any) => x.isActive)
          .map((x: any) => ({ id: x.paymentModeId, name: x.modeName })),
      );
      this.incomeSourceOptions.set(
        sourceRows
          .filter((x: any) => x.isActive)
          .map((x: any) => ({ id: x.sourceId, name: x.sourceName })),
      );

      const mappedTransactions: Transaction[] = this.rows(transactions)
        .filter((x: any) => x.userId === this.userId)
        .map((x: any) => ({
          transactionId: x.transactionId,
          userId: x.userId,
          categoryId: x.categoryId,
          paymentModeId: x.paymentModeId,
          transactionType: x.transactionType,
          amount: Number(x.amount),
          transactionDate: this.date(x.transactionDate),
          description: x.description || "",
          category:
            x.category?.categoryName ||
            categoryById.get(x.categoryId)?.categoryName ||
            "Other",
          paymentMode:
            x.paymentMode?.modeName ||
            paymentById.get(x.paymentModeId)?.modeName ||
            "Other",
        }));

      const mappedIncomes: Income[] = this.rows(incomes)
        .filter((x: any) => x.userId === this.userId)
        .map((x: any) => ({
          incomeId: x.incomeId,
          userId: x.userId,
          sourceId: x.sourceId,
          accountId: x.accountId,
          amount: Number(x.amount),
          incomeDate: this.date(x.incomeDate),
          description: x.description || "",
          source:
            x.source?.sourceName ||
            sourceById.get(x.sourceId)?.sourceName ||
            "Other",
          account: accountById.get(x.accountId)?.accountName || "Account",
        }));

      const mappedExpenses: Expense[] = this.rows(expenses)
        .filter((x: any) => x.userId === this.userId)
        .map((x: any) => ({
          expenseId: x.expenseId,
          userId: x.userId,
          categoryId: x.categoryId,
          accountId: x.accountId,
          paymentModeId: x.paymentModeId,
          amount: Number(x.amount),
          expenseDate: this.date(x.expenseDate),
          description: x.description || "",
          category:
            x.category?.categoryName ||
            categoryById.get(x.categoryId)?.categoryName ||
            "Other",
          paymentMode:
            x.paymentMode?.modeName ||
            paymentById.get(x.paymentModeId)?.modeName ||
            "Other",
          account: accountById.get(x.accountId)?.accountName || "Account",
        }));

      const mappedGoals: Goal[] = this.rows(goals).map((x: any) => ({
        goalId: x.savingsGoalId ?? x.goalId,
        userId: x.userId,
        goalName: x.goalName,
        targetAmount: Number(x.targetAmount),
        savedAmount: Number(x.savedAmount),
        targetDate: x.targetDate ? this.date(x.targetDate) : "",
      }));

      const mappedAccounts: Account[] = accountRows.map((x: any) => ({
        accountId: x.accountId,
        userId: x.userId,
        accountType: x.accountType,
        accountName: x.accountName,
        bankName: x.bankName || "",
        accountNumber: x.accountNumber || "",
        balance: Number(x.balance),
        isActive: !!x.isActive,
      }));

      const mappedBills: Bill[] = this.rows(bills).map((x: any) => ({
        recurringTransactionId: x.recurringTransactionId,
        userId: x.userId,
        accountId: x.accountId,
        categoryId: x.categoryId,
        paymentModeId: x.paymentModeId,
        transactionType: "Expense",
        amount: Number(x.amount),
        description: x.description || "",
        frequency: x.frequency,
        startDate: this.date(x.startDate),
        endDate: x.endDate ? this.date(x.endDate) : "",
        nextOccurrenceDate: this.date(x.nextOccurrenceDate),
        isActive: !!x.isActive,
      }));

      this.updateStore({
        transactions: mappedTransactions,
        incomes: mappedIncomes,
        expenses: mappedExpenses,
        goals: mappedGoals,
        accounts: mappedAccounts,
        bills: mappedBills,
      });

      this.online.set(true);
      return true;
    } catch (error) {
      console.error("Budget Tracker API sync failed", error);
      this.online.set(false);
      this.updateStore(emptyStore());
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  private async getAllPages(baseUrl: string, path: string): Promise<any[]> {
    const pageSize = 100;
    const first = await this.api.get<any>(
      baseUrl,
      `${path}&page=1&pageSize=${pageSize}`,
    );
    if (Array.isArray(first)) return first;

    const firstRows = first?.data || [];
    const totalPages = Number(first?.totalPages || 1);
    if (totalPages <= 1) return firstRows;

    const pages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        this.api.get<any>(
          baseUrl,
          `${path}&page=${index + 2}&pageSize=${pageSize}`,
        ),
      ),
    );

    return [
      firstRows,
      ...pages.map((x) => (Array.isArray(x) ? x : x?.data || [])),
    ].flat();
  }

  private rows(value: any): any[] {
    return Array.isArray(value) ? value : value?.data || [];
  }

  private date(value: string): string {
    return value ? value.substring(0, 10) : "";
  }
}
