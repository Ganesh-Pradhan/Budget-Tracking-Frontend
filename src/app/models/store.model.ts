import { Transaction } from "./transaction.model";
import { Income } from "./income.model";
import { Expense } from "./expense.model";
import { Goal } from "./goal.model";
import { Account } from "./account.model";
import { Bill } from "./bill.model";

export interface Store {
  transactions: Transaction[];
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  accounts: Account[];
  bills: Bill[];
}
export function emptyStore(): Store {
  return {
    transactions: [],
    incomes: [],
    expenses: [],
    goals: [],
    accounts: [],
    bills: [],
  };
}
