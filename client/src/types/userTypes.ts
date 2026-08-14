export interface Credentials {
  username: string;
  password: string;
}

export interface UserReturned {
  id: number;
  email: string;
  username: string;
  best_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface TokenReturned {
  user: UserReturned;
  access_token: string;
  token_type: string;
}

export interface UserInformation {
  username: string;
  email: string;
  best_score: number | null;
}

export interface PersistentUser {
  username: string;
  email: string;
  token: string;
}

export interface RegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface UpdatedUser {
  updated_user: RegisterUser;
  password: string;
}
