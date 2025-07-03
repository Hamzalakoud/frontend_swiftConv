// File: sc-mapping-directory.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScMappingDirectory {
  id?: number;
  repIn: string;
  repOut: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScMappingDirectoryService {
  private baseUrl = 'http://localhost:8080/api/sc-mapping-directory';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken') || '';
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getAll(): Observable<ScMappingDirectory[]> {
    return this.http.get<ScMappingDirectory[]>(this.baseUrl, this.getAuthHeaders());
  }

  getById(id: number): Observable<ScMappingDirectory> {
    return this.http.get<ScMappingDirectory>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  create(entity: ScMappingDirectory): Observable<ScMappingDirectory> {
    return this.http.post<ScMappingDirectory>(this.baseUrl, entity, this.getAuthHeaders());
  }

  update(id: number, entity: ScMappingDirectory): Observable<ScMappingDirectory> {
    return this.http.put<ScMappingDirectory>(`${this.baseUrl}/${id}`, entity, this.getAuthHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }
}
