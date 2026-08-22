import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isBrowser } from '../utils/platform';

export interface AdminSession {
  username: string;
  role: 'ADMIN';
  loggedAt: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'moustaparfum_admin_session';
  private readonly adminUsername = 'admin';
  private readonly adminPassword = 'admin123';
  private readonly sessionSubject = new BehaviorSubject<AdminSession | null>(this.readSession());

  session$ = this.sessionSubject.asObservable();

  get currentSession(): AdminSession | null {
    return this.sessionSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentSession;
  }

  login(username: string, password: string): boolean {
    const cleanUsername = username.trim();

    if (cleanUsername !== this.adminUsername || password !== this.adminPassword) {
      return false;
    }

    const session: AdminSession = {
      username: cleanUsername,
      role: 'ADMIN',
      loggedAt: new Date().toISOString(),
      token: btoa(`${cleanUsername}:${password}`)
    };

    if (isBrowser()) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }

    this.sessionSubject.next(session);
    return true;
  }

  logout(): void {
    if (isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }

    this.sessionSubject.next(null);
  }

  getAuthorizationHeader(): string | null {
    const session = this.currentSession;
    return session ? `Basic ${session.token}` : null;
  }

  private readSession(): AdminSession | null {
    if (!isBrowser()) {
      return null;
    }

    const rawSession = localStorage.getItem(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession) as AdminSession;

      if (!session.token) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
