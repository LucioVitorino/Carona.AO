import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthSession,
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'caronaao_token';
  private readonly userKey = 'caronaao_user';
  private readonly rememberKey = 'caronaao_remember_session';
  private readonly resetEmailKey = 'caronaao_reset_email';

  readonly user = signal<AuthUser | null>(this.restoreUser());

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string, rememberSession = true): Observable<AuthSession> {
    return this.http
      .post<ApiEnvelope<AuthSession>>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
        rememberSession,
      })
      .pipe(
        map((response) => response.data),
        tap((session) => this.persistSession(session, rememberSession)),
      );
  }

  register(payload: AuthRegisterPayload): Observable<AuthSession> {
    return this.http
      .post<ApiEnvelope<AuthSession>>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(
        map((response) => response.data),
        tap((session) => this.persistSession(session, true)),
      );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ApiEnvelope<ForgotPasswordResponse>>(`${environment.apiUrl}/auth/forgot-password`, payload)
      .pipe(
        map((response) => response.data),
        tap((result) => this.storeResetEmail(result.email ?? payload.email)),
      );
  }

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.http
      .post<ApiEnvelope<null>>(`${environment.apiUrl}/auth/reset-password`, {
        ...payload,
        password_confirmation: payload.passwordConfirmation,
      })
      .pipe(map(() => void 0));
  }

  refreshSession(): Observable<AuthSession> {
    return this.http
      .post<ApiEnvelope<AuthSession>>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        map((response) => response.data),
        tap((session) => this.persistSession(session, this.isRemembered())),
      );
  }

  logout(): void {
    this.clearSession();
  }

  getDashboardUrl(user: AuthUser | null = this.user()): string {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'driver':
        return '/motorista';
      case 'passenger':
        return '/passageiro';
      default:
        return '/login';
    }
  }

  getToken(): string | null {
    return this.getActiveStorage()?.getItem(this.tokenKey) ?? null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (!this.isTokenValid(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  isRemembered(): boolean {
    return this.getActiveStorage() === localStorage;
  }

  storeResetEmail(email: string): void {
    localStorage.setItem(this.resetEmailKey, email);
  }

  getResetEmail(): string | null {
    return localStorage.getItem(this.resetEmailKey);
  }

  clearResetEmail(): void {
    localStorage.removeItem(this.resetEmailKey);
  }

  private persistSession(session: AuthSession, rememberSession: boolean): void {
    this.clearSession();

    const storage = rememberSession ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, session.token);
    storage.setItem(this.userKey, JSON.stringify(session.user));
    storage.setItem(this.rememberKey, rememberSession ? '1' : '0');
    this.user.set(session.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.rememberKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.rememberKey);
    this.user.set(null);
  }

  private restoreUser(): AuthUser | null {
    const session = this.getStoredSession();
    return session?.user ?? null;
  }

  private getStoredSession(): AuthSession | null {
    const activeStorage = this.getActiveStorage();
    if (!activeStorage) {
      return null;
    }

    const token = activeStorage.getItem(this.tokenKey);
    const rawUser = activeStorage.getItem(this.userKey);
    if (!token || !rawUser || !this.isTokenValid(token)) {
      return null;
    }

    try {
      return {
        token,
        user: JSON.parse(rawUser) as AuthUser,
      };
    } catch {
      return null;
    }
  }

  private getActiveStorage(): Storage | null {
    if (localStorage.getItem(this.tokenKey)) {
      return localStorage;
    }

    if (sessionStorage.getItem(this.tokenKey)) {
      return sessionStorage;
    }

    return null;
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeTokenPayload(token);
    if (!payload) {
      return false;
    }

    if (typeof payload['exp'] === 'number') {
      return payload['exp'] * 1000 > Date.now();
    }

    return true;
  }

  private decodeTokenPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
