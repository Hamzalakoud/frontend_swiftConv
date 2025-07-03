import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScParamGlobal {
  id?: number;
  element: string;
  valeur: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScParamGlobalService {
  private baseUrl = 'http://localhost:8080/api/sc-param-global';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken') || '';
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getAll(): Observable<ScParamGlobal[]> {
    return this.http.get<ScParamGlobal[]>(this.baseUrl, this.getAuthHeaders());
  }

  getById(id: number): Observable<ScParamGlobal> {
    return this.http.get<ScParamGlobal>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  create(entity: ScParamGlobal): Observable<ScParamGlobal> {
    return this.http.post<ScParamGlobal>(this.baseUrl, entity, this.getAuthHeaders());
  }

  update(id: number, entity: ScParamGlobal): Observable<ScParamGlobal> {
    return this.http.put<ScParamGlobal>(`${this.baseUrl}/${id}`, entity, this.getAuthHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }
}
