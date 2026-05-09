export interface AccountIdResponse {
  id: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  profileImage?: string;
  facebookId?: string;
  googleId?: string;
  /** IANA zone for scheduled log summaries (server). */
  summaryTimeZone?: string | null;
  createdAt: string;
  deletedAt?: string;
}

export interface UpdateUserNameRequest {
  name: string;
}

export type UpdateAccountRequest = Partial<
  Pick<User, 'name' | 'email' | 'summaryTimeZone'>
>;
