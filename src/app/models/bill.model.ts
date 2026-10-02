export interface Bill {
  recurringTransactionId: number;
  userId: number;
  accountId: number;
  categoryId: number;
  paymentModeId: number;
  transactionType: "Expense";
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  endDate: string;
  nextOccurrenceDate: string;
  isActive: boolean;
}
