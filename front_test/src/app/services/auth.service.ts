import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth/login';

  // Check every 1 minute for token expiration (better UX)
  private readonly CHECK_INTERVAL = 60 * 1000;

  private jwtHelper = new JwtHelperService();
  private monitoringStarted = false;
  private lastTokenExpiredStatus = this.isTokenExpired();

  private isTokenExpiredSubject = new BehaviorSubject<boolean>(this.lastTokenExpiredStatus);
  tokenExpired$ = this.isTokenExpiredSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.startTokenMonitoring();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }
    return this.jwtHelper.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    return !this.isTokenExpired() && !!localStorage.getItem('userEmail');
  }

  private startTokenMonitoring(): void {
    if (this.monitoringStarted) return;
    this.monitoringStarted = true;

    interval(this.CHECK_INTERVAL).subscribe(() => {
      const expired = this.isTokenExpired();

      if (expired !== this.lastTokenExpiredStatus) {
        this.lastTokenExpiredStatus = expired;
        this.isTokenExpiredSubject.next(expired);

        if (expired) {
          alert('⚠️ Votre session a expiré. Veuillez vous reconnecter.');
          this.logout();
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.isTokenExpiredSubject.next(true);
    this.router.navigate(['/signin']); // Redirect to signin page
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, request);
  }

  saveToken(token: string, email: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    this.lastTokenExpiredStatus = this.isTokenExpired();
    this.isTokenExpiredSubject.next(this.lastTokenExpiredStatus);
  }
}
