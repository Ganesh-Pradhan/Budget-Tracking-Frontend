export type TransactionType = "Income" | "Expense" | "Need";
export interface Transaction {
  transactionId: number;
  userId: number;
  categoryId: number;
  paymentModeId: number;
  transactionType: TransactionType;
  amount: number;
  transactionDate: string;
  description: string;
  category: string;
  paymentMode: string;
}
