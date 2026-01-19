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
  createdAt: string;
  deletedAt?: string;
}

export interface UpdateUserNameRequest {
  name: string;
}
