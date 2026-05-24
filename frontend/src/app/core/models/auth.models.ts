export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin';
  photo?: string | null;
  phone?: string | null;
  status?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
