export interface Expense {
  expenseId: number;
  userId: number;
  categoryId: number;
  accountId: number;
  paymentModeId: number;
  amount: number;
  expenseDate: string;
  description: string;
  category: string;
  paymentMode: string;
  account: string;
}
