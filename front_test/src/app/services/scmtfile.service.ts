// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  registerUser(user: Partial<User>): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, user, {
      responseType: 'text'
    });
  }

  updateUser(id: number, user: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  getUserIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/id?email=${email}`, {
      headers: this.getAuthHeaders()
    });
  }
}
