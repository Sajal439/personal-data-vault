export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}
