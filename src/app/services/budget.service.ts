import { Injectable, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { StorageService } from "./storage.service";
import { ConfirmService } from "./confirm.service";
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
  sortColumn = signal<"date" | "amount" | null>(null);
  sortDirection = signal<"asc" | "desc">("asc");
  reportPeriod = "Monthly";
  apiChecking = false;
  apiStatus: "idle" | "success" | "error" = "idle";
  saving = signal(false);
  contributionAmount = "";
  contributionError: string | null = null;
  contributionTarget: any = null;
  chartMetric = signal<"expenses" | "income" | "net">("expenses");
  chartMetricMenuOpen = signal(false);

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
    private confirm: ConfirmService,
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

  private currentMonthString() {
    return new Date().toISOString().slice(0, 7);
  }

  isCurrentMonthOrLater(v: string): boolean {
    return v >= this.currentMonthString();
  }

  isFutureMonth(v: string): boolean {
    return v > this.currentMonthString();
  }

  async normalizeMonth() {
    if (this.isFutureMonth(this.month())) {
      this.month.set(this.currentMonthString());
      await this.loadBudget();
      this.loadReportMonths();
    }
  }

  async changeMonth(value: string) {
    await this.normalizeMonth();
    if (this.isFutureMonth(value)) return;
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
    let daily: number[] = [];
    const metric = this.chartMetric();
    
    if (metric === "expenses") {
      daily = Array.from({ length: days }, (_, i) =>
        this.store()
          .expenses.filter(
            (e) =>
              e.expenseDate ===
              `${this.month()}-${String(i + 1).padStart(2, "0")}`,
          )
          .reduce((sum, e) => sum + e.amount, 0),
      );
    } else if (metric === "income") {
      daily = Array.from({ length: days }, (_, dayIndex) =>
        this.store()
          .incomes.filter(
            (inc) =>
              inc.incomeDate ===
              `${this.month()}-${String(dayIndex + 1).padStart(2, "0")}`,
          )
          .reduce((sum, inc) => sum + inc.amount, 0),
      );
    } else if (metric === "net") {
      daily = Array.from({ length: days }, (_, dayIndex) => {
        const dateStr = `${this.month()}-${String(dayIndex + 1).padStart(2, "0")}`;
        const expenses = this.store()
          .expenses.filter((e) => e.expenseDate === dateStr)
          .reduce((sum, e) => sum + e.amount, 0);
        const income = this.store()
          .incomes.filter((inc) => inc.incomeDate === dateStr)
          .reduce((sum, inc) => sum + inc.amount, 0);
        return income - expenses;
      });
    }
    
    const max = Math.max(...daily.map(Math.abs), 1);
    return daily.map((v) => Math.max(3, Math.round((Math.abs(v) / max) * 100)));
  }

  get monthChartLabels(): string[] {
    const [year, month] = this.month().split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    if (days <= 1) return [`1 ${this.monthLabel(this.month()).split(" ")[0]}`];
    const mid = Math.ceil(days / 2);
    const fmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
    return [
      fmt.format(new Date(year, month - 1, 1)),
      fmt.format(new Date(year, month - 1, mid)),
      fmt.format(new Date(year, month - 1, days)),
    ];
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

  get sortedIncomes() {
    let result = [...this.store().incomes];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (col) {
      result = result.sort((a, b) => {
        let aVal: any, bVal: any;
        if (col === "date") {
          aVal = new Date(a.incomeDate).getTime();
          bVal = new Date(b.incomeDate).getTime();
        } else if (col === "amount") {
          aVal = a.amount;
          bVal = b.amount;
        }
        if (aVal < bVal) return dir === "asc" ? -1 : 1;
        if (aVal > bVal) return dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }

  get monthExpenses() {
    return this.store()
      .expenses.filter((e) => e.expenseDate.startsWith(this.month()))
      .reduce((sum, item) => sum + item.amount, 0);
  }

  get sortedExpenses() {
    let result = [...this.store().expenses];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (col) {
      result = result.sort((a, b) => {
        let aVal: any, bVal: any;
        if (col === "date") {
          aVal = new Date(a.expenseDate).getTime();
          bVal = new Date(b.expenseDate).getTime();
        } else if (col === "amount") {
          aVal = a.amount;
          bVal = b.amount;
        }
        if (aVal < bVal) return dir === "asc" ? -1 : 1;
        if (aVal > bVal) return dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
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

  get sortedBills() {
    let result = [...this.store().bills];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (col) {
      result = result.sort((a, b) => {
        let aVal: any, bVal: any;
        if (col === "date") {
          aVal = new Date(a.nextOccurrenceDate).getTime();
          bVal = new Date(b.nextOccurrenceDate).getTime();
        } else if (col === "amount") {
          aVal = a.amount;
          bVal = b.amount;
        }
        if (aVal < bVal) return dir === "asc" ? -1 : 1;
        if (aVal > bVal) return dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
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
    let result = this.store().transactions.filter(
      (t) =>
        (!this.search ||
          t.description.toLowerCase().includes(this.search.toLowerCase()) ||
          t.category.toLowerCase().includes(this.search.toLowerCase())) &&
        (this.filterType === "All" || t.transactionType === this.filterType) &&
        (this.filterMode === "All" || t.paymentMode === this.filterMode),
    );

    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (col) {
      result = [...result].sort((a, b) => {
        let aVal: any, bVal: any;
        if (col === "date") {
          aVal = new Date(a.transactionDate).getTime();
          bVal = new Date(b.transactionDate).getTime();
        } else if (col === "amount") {
          aVal = a.amount;
          bVal = b.amount;
        }
        if (aVal < bVal) return dir === "asc" ? -1 : 1;
        if (aVal > bVal) return dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }

  toggleSort(column: "date" | "amount") {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set("asc");
    }
  }

  setChartMetric(metric: "expenses" | "income" | "net") {
    this.chartMetric.set(metric);
    this.chartMetricMenuOpen.set(false);
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
    // 'add-money' is not an edit operation: keep `editing` null so the
    // generic saveModal() can never report a false "Changes saved" success
    // and the header does not read "Edit add-money".
    this.editing = type === "add-money" ? null : item || null;
    this.contributionError = null;
    this.contributionTarget = type === "add-money" ? item || null : null;
    this.contributionAmount = "";
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
      targetDate:
        type === "goal"
          ? item?.targetDate || ""
          : item?.nextOccurrenceDate ||
            new Date().toISOString().slice(0, 10),
      savedAmount: type === "goal" ? item?.savedAmount ?? 0 : "",
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
    this.contributionTarget = null;
    this.contributionAmount = "";
    this.contributionError = null;
  }

  /** Add Money: contribution = validated amount, new saved = current saved + contribution.
   *  Persists via PUT /api/savingsgoals/{id} with the full goal payload.
   *  Backend rejects savedAmount > targetAmount, and progress = saved/target*100. */

  async saveContribution() {
    if (this.saving()) return;
    const goal = this.contributionTarget;
    const raw = String(this.contributionAmount ?? "").trim();
    const amount = Number(raw);
    // Reject empty, non-numeric, zero, negative.
    if (!goal || raw === "" || !Number.isFinite(amount) || amount <= 0) {
      this.contributionError = "Please enter an amount greater than 0.";
      return;
    }
    // Resolve the id defensively (store uses goalId; API payloads may vary in casing).
    const goalId =
      goal.goalId ?? goal.savingsGoalId ?? goal.SavingsGoalId ?? goal.GoalId ?? goal.id;
    if (!goalId) {
      this.contributionError = "Could not identify this goal. Please reopen the popup.";
      return;
    }
    // Re-read the freshest saved/target values from the store so a stale
    // popup snapshot can never overwrite a newer persisted value.
    const fresh =
      this.store().goals.find((g: any) => (g.goalId ?? g.savingsGoalId) === goalId) || goal;
    const currentSaved = Number((fresh as any).savedAmount ?? (fresh as any).SavedAmount) || 0;
    const target = Number((fresh as any).targetAmount ?? (fresh as any).TargetAmount) || 0;
    const newSaved = Math.round((currentSaved + amount) * 100) / 100;
    // Follow backend business rule: savedAmount must not exceed targetAmount.
    if (target > 0 && newSaved > target) {
      this.contributionError = `Contribution would exceed the goal. You can add up to ${this.money(target - currentSaved)} more.`;
      return;
    }
    if (!this.connectionIsAvailable()) {
      this.contributionError = "API is not connected. Start the backend and try again.";
      return;
    }
    this.saving.set(true);
    this.contributionError = null;
    try {
      const datePart = (fresh as any).targetDate
        ? String((fresh as any).targetDate).substring(0, 10)
        : null;
      const updated: any = await this.api.put(
        this.settings().apiBaseUrl,
        `/api/savingsgoals/${goalId}`,
        {
          goalName: (fresh as any).goalName ?? goal.goalName,
          targetAmount: target,
          savedAmount: newSaved,
          targetDate: datePart,
        },
      );
      // Optimistically patch the goal in the store from the PUT response so
      // the card (saved amount / remaining / progress bar) updates instantly,
      // even if the follow-up full sync fails. Keys are read case-insensitively
      // because the API may serialize PascalCase or camelCase.
      const respSaved = Number(
        updated?.savedAmount ?? updated?.SavedAmount ?? newSaved,
      );
      const respTarget = Number(
        updated?.targetAmount ?? updated?.TargetAmount ?? target,
      );
      const current = this.store();
      this.storage.updateStore({
        ...current,
        goals: current.goals.map((g: any) =>
          (g.goalId ?? g.savingsGoalId) === goalId
            ? { ...g, savedAmount: respSaved, targetAmount: respTarget }
            : g,
        ),
      });
      // Refresh from the backend so the UI reflects persisted values and
      // survives a browser refresh. A sync failure must not mask a
      // successful save because the optimistic patch above already applied it.
      try {
        await this.storage.syncFromApi();
      } catch {
        /* keep optimistic values; next page load re-syncs */
      }
      const goalName = (fresh as any).goalName ?? goal.goalName ?? "goal";
      this.closeModal();
      this.notify(`Added ${this.money(amount)} to "${goalName}"`);
    } catch (error: any) {
      // Keep the popup open so the user can retry; no success toast here.
      this.contributionError =
        error?.message || "Could not add money to this goal.";
    } finally {
      this.saving.set(false);
    }
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

    // 'add-money' has its own saver. Never let the generic saver report
    // success for it (it would show "Changes saved" without any PUT).
    if (type === "add-money") {
      await this.saveContribution();
      return;
    }
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
          savedAmount: Number(f.savedAmount) || (this.editing?.savedAmount || 0),
          targetDate: f.targetDate || null,
        };
        if (this.editing)
          await this.api.put(
            baseUrl,
            `/api/savingsgoals/${this.editing.goalId}`,
            {
              goalName: f.description,
              targetAmount: amount,
              savedAmount: Number(f.savedAmount) || (this.editing.savedAmount || 0),
              targetDate: f.targetDate || null,
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
    const confirmed = await this.confirm.confirm(
      "Delete transaction?",
      `Are you sure you want to delete "${t.description}"?\nThis action cannot be undone.`,
      { confirmText: "Delete", cancelText: "Cancel" }
    );
    if (!confirmed) return;
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

  async deleteIncome(income: any) {
    const confirmed = await this.confirm.confirm(
      "Delete income?",
      `Are you sure you want to delete "${income.description}"?\nThis action cannot be undone.`,
      { confirmText: "Delete", cancelText: "Cancel" }
    );
    if (!confirmed) return;
    try {
      if (!this.connectionIsAvailable())
        throw new Error("API is not connected.");
      await this.api.delete(
        this.settings().apiBaseUrl,
        `/api/incomes/${income.incomeId}`,
      );
      await this.storage.syncFromApi();
      this.notify("Income deleted");
    } catch (error: any) {
      this.notify(error?.message || "Could not delete income", "error");
    }
  }

  async deleteExpense(expense: any) {
    const confirmed = await this.confirm.confirm(
      "Delete expense?",
      `Are you sure you want to delete "${expense.description}"?\nThis action cannot be undone.`,
      { confirmText: "Delete", cancelText: "Cancel" }
    );
    if (!confirmed) return;
    try {
      if (!this.connectionIsAvailable())
        throw new Error("API is not connected.");
      await this.api.delete(
        this.settings().apiBaseUrl,
        `/api/expenses/${expense.expenseId}`,
      );
      await this.storage.syncFromApi();
      this.notify("Expense deleted");
    } catch (error: any) {
      this.notify(error?.message || "Could not delete expense", "error");
    }
  }

  async deleteItem(type: "goals" | "accounts" | "bills", id: number) {
    const typeLabel =
      type === "bills"
        ? "recurring bill"
        : type === "accounts"
        ? "account"
        : "goal";
    const confirmed = await this.confirm.confirm(
      `Delete ${typeLabel}?`,
      `Are you sure you want to delete this ${typeLabel}?\nThis action cannot be undone.`,
      { confirmText: "Delete", cancelText: "Cancel" }
    );
    if (!confirmed) return;
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
