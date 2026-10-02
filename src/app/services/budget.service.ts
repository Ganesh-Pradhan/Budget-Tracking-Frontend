import { Injectable, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { StorageService } from "./storage.service";
import { Transaction } from "../models";

/**
 * Central application facade that owns all of the shared budget-tracker
 * state and behaviour that previously lived inside AppComponent. Page
 * components and the application shell inject this service so that there is
 * a single source of truth (store, settings, month, modal, form, toast, …).
 */
@Injectable({ providedIn: "root" })
export class BudgetService {
  Math = Math;
  store!: StorageService["store"];
  settings!: StorageService["settings"];
  mobileOpen = signal(false);
  modal = signal<string | null>(null);
  editing: any = null;
  toast = signal<{ message: string; kind: "success" | "error" } | null>(null);
  connection = signal<"disconnected" | "connected" | "checking">("checking");
  month = signal(new Date().toISOString().slice(0, 7));
  search = "";
  filterType = "All";
  filterMode = "All";
  reportPeriod = "Monthly";
  apiChecking = false;
  apiStatus: "idle" | "success" | "error" = "idle";
  saving = signal(false);

  months = this.buildMonths();
  categories: string[] = [];
  paymentModes: string[] = [];
  budgetAmount = signal(0);
  reportMonths = signal<{ label: string; amount: number }[]>([]);
  form: any = {
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    type: "Expense",
    extra: "Monthly",
    accountId: "",
    paymentModeId: "",
    sourceId: "",
  };

  readonly path = computed(() => location.pathname);

  private initialized = false;

  constructor(
    private storage: StorageService,
    private router: Router,
    private api: ApiService,
  ) {
    this.store = this.storage.store;
    this.settings = this.storage.settings;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    document.documentElement.classList.toggle(
      "dark",
      this.settings().theme === "dark",
    );
    await this.refreshFromApi();
  }

  private buildMonths() {
    const result: string[] = [];
    const now = new Date();
    for (let i = -5; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      result.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      );
    }
    return result;
  }

  private async refreshFromApi() {
    this.connection.set("checking");
    try {
      await this.storage.syncFromApi();
      this.connection.set("connected");
      this.apiStatus = "success";
      this.applyApiOptions();
      await this.loadBudget();
      this.loadReportMonths();
    } catch (error: any) {
      this.connection.set("disconnected");
      this.apiStatus = "error";
      this.notify(
        error?.message || "Could not load data from the API",
        "error",
      );
    }
  }

  private async loadBudget() {
    const [year, month] = this.month().split("-").map(Number);
    try {
      const result = await this.api.get<any>(
        this.settings().apiBaseUrl,
        `/api/budgets/summary/monthly?userId=${this.storage.currentUserId}&year=${year}&month=${month}`,
      );
      this.budgetAmount.set(
        Number(result?.budgetAmount ?? result?.amount ?? 0),
      );
    } catch {
      this.budgetAmount.set(0);
    }
  }

  private loadReportMonths() {
    const year = new Date().getFullYear();
    const values = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, new Date().getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const amount = this.store()
        .expenses.filter((e) => e.expenseDate.startsWith(key))
        .reduce((sum, e) => sum + e.amount, 0);
      return { label: d.toLocaleString("en-US", { month: "short" }), amount };
    });
    this.reportMonths.set(values);
  }

  async changeMonth(value: string) {
    this.month.set(value);
    await this.loadBudget();
    this.loadReportMonths();
  }

  private applyApiOptions() {
    const categories = this.storage.categoryOptions();
    const paymentModes = this.storage.paymentModeOptions();
    this.categories = categories.map((x) => x.name);
    this.paymentModes = paymentModes.map((x) => x.name);
  }

  get page() {
    const p = location.pathname.split("/").filter(Boolean)[0] || "dashboard";
    return [
      "dashboard",
      "transactions",
      "income",
      "expenses",
      "budget",
      "yearly-summary",
      "savings-goals",
      "accounts",
      "bills",
      "reports",
      "settings",
    ].includes(p)
      ? p
      : "not-found";
  }

  money(v: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.settings().currency,
      maximumFractionDigits: 2,
    }).format(v || 0);
  }

  compactMoney(v: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.settings().currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(v || 0);
  }

  dateLabel(v: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(`${v}T12:00:00`));
  }

  monthLabel(v: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(`${v}-01T12:00:00`));
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  todayLabel() {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }

  get monthDailyBars() {
    const [year, month] = this.month().split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    const daily = Array.from({ length: days }, (_, i) =>
      this.store()
        .expenses.filter(
          (e) =>
            e.expenseDate ===
            `${this.month()}-${String(i + 1).padStart(2, "0")}`,
        )
        .reduce((sum, e) => sum + e.amount, 0),
    );
    const max = Math.max(...daily, 1);
    return daily.map((v) => Math.max(3, Math.round((v / max) * 100)));
  }

  get reportMax() {
    return Math.max(...this.reportMonths().map((x) => x.amount), 1);
  }

  get monthTransactions() {
    return this.store().transactions.filter((t) =>
      t.transactionDate.startsWith(this.month()),
    );
  }

  get monthIncome() {
    return this.store()
      .incomes.filter((i) => i.incomeDate.startsWith(this.month()))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get monthExpenses() {
    return this.store()
      .expenses.filter((e) => e.expenseDate.startsWith(this.month()))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get accountsTotal() {
    return this.store().accounts.reduce((sum, a) => sum + a.balance, 0);
  }
  incomeBySource(source: string) {
    return this.store()
      .incomes.filter((i) => i.source === source)
      .reduce((sum, i) => sum + i.amount, 0);
  }
  totalIncome() {
    return this.store().incomes.reduce((sum, i) => sum + i.amount, 0);
  }
  totalExpenses() {
    return this.store().expenses.reduce((sum, e) => sum + e.amount, 0);
  }
  totalBills() {
    return this.store().bills.reduce((sum, b) => sum + b.amount, 0);
  }

  get categoriesSpend() {
    return this.categories
      .map((category) => ({
        category,
        amount: this.monthExpensesByCategory(category),
      }))
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  private monthExpensesByCategory(category: string) {
    return this.store()
      .expenses.filter(
        (e) =>
          e.expenseDate.startsWith(this.month()) && e.category === category,
      )
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get filteredTransactions() {
    return this.store().transactions.filter(
      (t) =>
        (!this.search ||
          t.description.toLowerCase().includes(this.search.toLowerCase()) ||
          t.category.toLowerCase().includes(this.search.toLowerCase())) &&
        (this.filterType === "All" || t.transactionType === this.filterType) &&
        (this.filterMode === "All" || t.paymentMode === this.filterMode),
    );
  }

  get accounts() {
    return this.store().accounts.filter((a) => a.isActive);
  }
  get activeGoal() {
    return this.store().goals[0] || null;
  }
  get topCategories() {
    const total = this.monthExpenses || 1;
    return this.categoriesSpend
      .slice(0, 4)
      .map((x) => ({ ...x, percent: Math.round((x.amount / total) * 100) }));
  }
  get monthBudgetPercent() {
    return this.budgetAmount() > 0
      ? Math.min(100, (this.monthExpenses / this.budgetAmount()) * 100)
      : 0;
  }
  get budgetRemaining() {
    return Math.max(0, this.budgetAmount() - this.monthExpenses);
  }
  get apiCategories() {
    return this.storage.categoryOptions();
  }
  get apiPaymentModes() {
    return this.storage.paymentModeOptions();
  }
  get apiIncomeSources() {
    return this.storage.incomeSourceOptions();
  }

  notify(message: string, kind: "success" | "error" = "success") {
    this.toast.set({ message, kind });
    setTimeout(() => this.toast.set(null), 2600);
  }

  nav(path: string) {
    this.router.navigateByUrl("/" + path);
    this.mobileOpen.set(false);
  }

  openModal(type: string, item?: any) {
    this.modal.set(type);
    this.editing = item || null;
    this.form = {
      description:
        item?.description || item?.goalName || item?.accountName || "",
      amount: item?.amount ?? item?.targetAmount ?? item?.balance ?? "",
      date:
        item?.transactionDate ||
        item?.incomeDate ||
        item?.expenseDate ||
        item?.targetDate ||
        item?.nextOccurrenceDate ||
        new Date().toISOString().slice(0, 10),
      category: item?.category || this.categories[0] || "",
      type: item?.transactionType || "Expense",
      extra:
        type === "income"
          ? item?.source || this.storage.incomeSourceOptions()[0]?.name || ""
          : type === "account"
            ? item?.bankName || ""
            : item?.frequency || "Monthly",
      accountId: item?.accountId || this.accounts[0]?.accountId || "",
      paymentModeId:
        item?.paymentModeId || this.storage.paymentModeOptions()[0]?.id || "",
      sourceId:
        item?.sourceId || this.storage.incomeSourceOptions()[0]?.id || "",
    };
  }

  closeModal() {
    this.modal.set(null);
    this.editing = null;
  }

  private categoryId(name: string): number {
    return this.storage.categoryOptions().find((x) => x.name === name)?.id || 0;
  }

  private paymentModeId(name?: string): number {
    return (
      this.storage.paymentModeOptions().find((x) => x.name === name)?.id ||
      Number(this.form.paymentModeId) ||
      0
    );
  }

  private sourceId(name?: string): number {
    return (
      this.storage.incomeSourceOptions().find((x) => x.name === name)?.id ||
      Number(this.form.sourceId) ||
      0
    );
  }

  async saveModal() {
    if (this.saving()) return;

    const type = this.modal();
    const f = this.form;
    const amount = Number(f.amount);
    const baseUrl = this.settings().apiBaseUrl;

    const amountIsValid = type === "account" ? amount >= 0 : amount > 0;
    if (!type || !f.description?.trim() || !amountIsValid) {
      this.notify(
        type === "account"
          ? "Please enter an account name and a valid balance."
          : "Please complete the required fields and enter an amount greater than 0.",
        "error",
      );
      return;
    }

    if (!baseUrl || !this.connectionIsAvailable()) {
      this.notify(
        "API is not connected. Start the backend and try again.",
        "error",
      );
      return;
    }

    this.saving.set(true);
    try {
      const userId = this.storage.currentUserId;
      const accountId = Number(f.accountId) || this.accounts[0]?.accountId;
      const paymentModeId =
        Number(f.paymentModeId) ||
        this.storage.paymentModeOptions()[0]?.id ||
        1;
      const categoryId = this.categoryId(f.category);
      if (
        (type === "transaction" || type === "expense" || type === "bill") &&
        (!categoryId || !paymentModeId)
      ) {
        throw new Error(
          "Please select a valid category and payment mode from the database.",
        );
      }
      if (
        (type === "income" || type === "expense" || type === "bill") &&
        !accountId
      ) {
        throw new Error("Please select an account from the database.");
      }

      if (type === "transaction") {
        const payload = {
          userId,
          categoryId,
          paymentModeId,
          transactionType: f.type,
          amount,
          transactionDate: f.date,
          description: f.description,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/transactions/${this.editing.transactionId}`,
            {
              categoryId,
              paymentModeId,
              transactionType: f.type,
              amount,
              transactionDate: f.date,
              description: f.description,
            },
          );
        else await this.api.post(baseUrl, "/api/transactions", payload);
      }

      if (type === "income") {
        const payload = {
          userId,
          sourceId: this.sourceId(f.extra),
          accountId,
          amount,
          incomeDate: f.date,
          description: f.description,
        };
        if (this.editing)
          await this.api.put(baseUrl, `/api/incomes/${this.editing.incomeId}`, {
            sourceId: payload.sourceId,
            accountId,
            amount,
            incomeDate: f.date,
            description: f.description,
          });
        else await this.api.post(baseUrl, "/api/incomes", payload);
      }

      if (type === "expense") {
        const payload = {
          userId,
          categoryId,
          accountId,
          paymentModeId,
          amount,
          expenseDate: f.date,
          description: f.description,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/expenses/${this.editing.expenseId}`,
            {
              categoryId,
              accountId,
              paymentModeId,
              amount,
              expenseDate: f.date,
              description: f.description,
            },
          );
        else await this.api.post(baseUrl, "/api/expenses", payload);
      }

      if (type === "goal") {
        const payload = {
          userId,
          goalName: f.description,
          targetAmount: amount,
          savedAmount: this.editing?.savedAmount || 0,
          targetDate: f.date || null,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/savingsgoals/${this.editing.goalId}`,
            {
              goalName: f.description,
              targetAmount: amount,
              savedAmount: this.editing.savedAmount || 0,
              targetDate: f.date || null,
            },
          );
        else await this.api.post(baseUrl, "/api/savingsgoals", payload);
      }

      if (type === "account") {
        const payload = {
          userId,
          accountType: this.editing?.accountType || "Checking",
          accountName: f.description,
          bankName: f.extra || null,
          accountNumber: this.editing?.accountNumber || null,
          balance: amount,
          isActive: true,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/accounts/${this.editing.accountId}`,
            {
              accountType: payload.accountType,
              accountName: payload.accountName,
              bankName: payload.bankName,
              accountNumber: payload.accountNumber,
              balance: payload.balance,
              isActive: payload.isActive,
            },
          );
        else await this.api.post(baseUrl, "/api/accounts", payload);
      }

      if (type === "bill") {
        const payload = {
          userId,
          accountId,
          categoryId,
          paymentModeId,
          transactionType: "Expense",
          amount,
          description: f.description,
          frequency: f.extra || "Monthly",
          startDate:
            this.editing?.startDate || new Date().toISOString().slice(0, 10),
          endDate: null,
          nextOccurrenceDate: f.date,
          isActive: true,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/recurringtransactions/${this.editing.recurringTransactionId}`,
            {
              transactionType: "Expense",
              amount,
              description: f.description,
              frequency: f.extra || "Monthly",
              startDate:
                this.editing.startDate || new Date().toISOString().slice(0, 10),
              endDate: this.editing.endDate || null,
              nextOccurrenceDate: f.date,
              isActive: true,
            },
          );
        else
          await this.api.post(baseUrl, "/api/recurringtransactions", payload);
      }

      await this.storage.syncFromApi();
      this.applyApiOptions();
      const message = this.editing ? "Changes saved" : "Added successfully";
      this.closeModal();
      this.notify(message);
    } catch (error: any) {
      this.notify(error?.message || "Could not save changes", "error");
    } finally {
      this.saving.set(false);
    }
  }

  private connectionIsAvailable() {
    return this.connection() === "connected" && this.storage.online();
  }

  async deleteTransaction(t: Transaction) {
    if (!confirm("Delete this transaction?")) return;
    try {
      if (!this.connectionIsAvailable())
        throw new Error("API is not connected.");
      await this.api.delete(
        this.settings().apiBaseUrl,
        `/api/transactions/${t.transactionId}`,
      );
      await this.storage.syncFromApi();
      this.notify("Transaction deleted");
    } catch (error: any) {
      this.notify(error?.message || "Could not delete transaction", "error");
    }
  }

  async deleteItem(type: "goals" | "accounts" | "bills", id: number) {
    if (
      !confirm(
        `Delete this ${type === "bills" ? "recurring bill" : type === "accounts" ? "account" : "goal"}?`,
      )
    )
      return;
    try {
      const path =
        type === "goals"
          ? "savingsgoals"
          : type === "accounts"
            ? "accounts"
            : "recurringtransactions";
      if (!this.connectionIsAvailable())
        throw new Error("API is not connected.");
      await this.api.delete(this.settings().apiBaseUrl, `/api/${path}/${id}`);
      await this.storage.syncFromApi();
      this.notify("Deleted successfully");
    } catch (error: any) {
      this.notify(error?.message || "Could not delete item", "error");
    }
  }

  async testConnection() {
    this.apiChecking = true;
    this.apiStatus = "idle";
    const ok = await this.api.testConnection(this.settings().apiBaseUrl);
    this.apiChecking = false;
    this.apiStatus = ok ? "success" : "error";
    this.connection.set(ok ? "connected" : "disconnected");
    if (ok) {
      try {
        await this.storage.syncFromApi();
        this.applyApiOptions();
        await this.loadBudget();
        this.loadReportMonths();
        this.notify("API connection verified");
      } catch (error: any) {
        this.apiStatus = "error";
        this.connection.set("disconnected");
        this.notify(
          error?.message ||
            "API connection succeeded but data could not be loaded",
          "error",
        );
      }
    } else {
      this.notify("Could not reach the API.", "error");
    }
  }

  updateSetting(patch: any) {
    this.storage.updateSettings(patch);
  }

  exportReport() {
    const rows = this.store()
      .transactions.map(
        (t) =>
          `${t.transactionDate},${t.transactionType},${t.description},${t.amount}`,
      )
      .join("\n");
    const blob = new Blob([`Date,Type,Description,Amount\n${rows}`], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "budget-tracker-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    this.notify("Report exported as CSV");
  }


  
}
