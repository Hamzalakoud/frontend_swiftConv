import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScMappingMxToMt {
  id?: number;
  tag: string;
  function: string;
  path: string;
  attribut: string;
  msgType: string;
  sens: string;
  ordre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MappingMxToMtService {

  private baseUrl = 'http://localhost:8080/api/sc-mapping-mx-to-mt'; // Adjust if needed

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken'); // Adjust token storage if needed
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getAll(): Observable<ScMappingMxToMt[]> {
    return this.http.get<ScMappingMxToMt[]>(this.baseUrl, this.getAuthHeaders());
  }

  getById(id: number): Observable<ScMappingMxToMt> {
    return this.http.get<ScMappingMxToMt>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  create(entity: ScMappingMxToMt): Observable<ScMappingMxToMt> {
    return this.http.post<ScMappingMxToMt>(this.baseUrl, entity, this.getAuthHeaders());
  }

  update(id: number, entity: ScMappingMxToMt): Observable<ScMappingMxToMt> {
    return this.http.put<ScMappingMxToMt>(`${this.baseUrl}/${id}`, entity, this.getAuthHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }
}
