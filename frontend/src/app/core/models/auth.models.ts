export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin';
  photo?: string | null;
  phone?: string | null;
  status?: string;
  email_verified_at?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
  rememberSession?: boolean;
}

export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'passenger' | 'driver';
  phone?: string;
  photo?: string;
}

export interface ForgotPasswordResponse {
  email: string;
  resetToken?: string | null;
  resetUrl?: string | null;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}
