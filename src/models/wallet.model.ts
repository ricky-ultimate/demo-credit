export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWalletPayload {
  id: string;
  user_id: string;
}
