import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScMappingMtToMx {
  id?: number;
  mtType: string;
  mtTag: string;
  attribut: string;
  mxType: string;
  mxPath: string;
  convFunc: string;
  niveau: string;
}

@Injectable({
  providedIn: 'root'
})
export class MappingMtToMxService {

  private baseUrl = 'http://localhost:8080/api/sc-mapping-mt-to-mx'; // Adjust if needed

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken'); // Change if you store token elsewhere
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getAll(): Observable<ScMappingMtToMx[]> {
    return this.http.get<ScMappingMtToMx[]>(this.baseUrl, this.getAuthHeaders());
  }

  getById(id: number): Observable<ScMappingMtToMx> {
    return this.http.get<ScMappingMtToMx>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  create(entity: ScMappingMtToMx): Observable<ScMappingMtToMx> {
    return this.http.post<ScMappingMtToMx>(this.baseUrl, entity, this.getAuthHeaders());
  }

  update(id: number, entity: ScMappingMtToMx): Observable<ScMappingMtToMx> {
    return this.http.put<ScMappingMtToMx>(`${this.baseUrl}/${id}`, entity, this.getAuthHeaders());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }
}
