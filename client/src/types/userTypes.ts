export interface Credentials {
  username: string;
  password: string;
}

export interface EmailReturned {
  id: number;
  user_id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SteamReturned {
  id: number;
  user_id: number;
  profile_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserReturned {
  id: number;
  username: string;
  best_score: number | null;
  email_login: EmailReturned;
  steam_login: SteamReturned;
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
  best_score: number | null;
}

export interface PersistentUser {
  display: string;
  username: string;
  token: string;
}

export interface RegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface UpdatedUser {
  updated_username: string;
  password: string;
}

export interface Username {
  username: string;
}
