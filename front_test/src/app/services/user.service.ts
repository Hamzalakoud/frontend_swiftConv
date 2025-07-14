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
  password?: string;  // optional for User model
  role: string;
  status: boolean;
  creationDate: string;
  lastUpdateDate: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;  // optional during registration
  role: string;
  status?: boolean;   // optional, may be set by backend
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';


  constructor(private http: HttpClient) {}

  /** Get all users (public, no auth required) */
  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<User[]>(this.baseUrl, { headers });
  }


  /** Get a user by ID (public) */

  getUserById(id: number) {
    const token = localStorage.getItem('authToken'); // or from a service
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/${id}`, { headers });
  }

  /** Register a new user (public) */
  registerUser(user: RegisterRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, user, { responseType: 'text' });
  }

  /** Update user data (requires JWT authorization) */
  updateUser(id: number, updatedUser: RegisterRequest): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<AuthResponse>(`${this.baseUrl}/update/${id}`, updatedUser, { headers });
  }

  /** Delete a user by ID (requires JWT authorization) */
  deleteUser(id: number): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { headers, responseType: 'text' });
  }

  /** Get user ID by email (public) */
  getUserIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/id?email=${encodeURIComponent(email)}`);
  }

  /** Helper: prepare HTTP headers with JWT authorization */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
