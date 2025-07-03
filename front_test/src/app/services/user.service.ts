// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from './auth.service';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role: string;
  status: boolean;
  creationDate: string;
  lastUpdateDate: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  status?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  // Public endpoints (no auth needed)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  registerUser(user: RegisterRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, user, { responseType: 'text' });
  }

  // Protected endpoints (send JWT token)
  updateUser(id: number, updatedUser: RegisterRequest): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<AuthResponse>(`${this.baseUrl}/update/${id}`, updatedUser, { headers });
  }

  deleteUser(id: number): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { headers, responseType: 'text' });
  }

  // This endpoint appears public, no auth needed
  getUserIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/id?email=${encodeURIComponent(email)}`);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
