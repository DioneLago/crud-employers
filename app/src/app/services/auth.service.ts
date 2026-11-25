import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/employer.model';

interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'genyo_crud_employers_token';
const USER_KEY = 'genyo_crud_employers_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        })
      );
  }

  logout(revokeToken = true) {
    // Um 401 já encerra a sessão local e não precisa de outra chamada à API.
    const request$ = revokeToken
      ? this.http.post<void>(`${this.apiUrl}/auth/logout`, {})
      : of<void>(undefined);

    return request$.pipe(
      tap(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}
