export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  is_blacklisted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserPayload {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}
