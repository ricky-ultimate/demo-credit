export type TransactionType = "deposit" | "transfer" | "withdrawal";
export type TransactionStatus = "pending" | "success" | "failed";

export interface Transaction {
  id: string;
  reference: string;
  sender_wallet_id: string | null;
  receiver_wallet_id: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  created_at: Date;
}

export interface CreateTransactionPayload {
  id: string;
  reference: string;
  sender_wallet_id?: string | null;
  receiver_wallet_id?: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
}
