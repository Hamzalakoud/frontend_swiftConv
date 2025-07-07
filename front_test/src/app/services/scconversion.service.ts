import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScConversion {
  id: number;
  filename: string;
  msgCateg: string;
  msgType: string;
  bicEm: string;
  bicDe: string;
  uertr: string;
  amount: number;
  currency: string;
  customerAccount: string;
  tag71A: string;
  msgOrigMT: string | null;
  msgOrigMX: string | null;
  status: string;
  sens: string;
  toConvert: string;
  creationDate: Date;
  updateDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ScConversionService  {
  private apiUrl = '/api/sc-conversion';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getFiles(): Observable<ScConversion[]> {
    return this.http.get<ScConversion[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getFilteredFiles(filter: any): Observable<ScConversion[]> {
    const params = new URLSearchParams();
    for (const key in filter) {
      const value = filter[key];
      if (value !== null && value !== undefined && value.toString().trim() !== '') {
        params.set(key, value);
      }
    }
    return this.http.get<ScConversion[]>(`${this.apiUrl}/filtered?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
  }

  getFileById(id: number): Observable<ScConversion> {
    return this.http.get<ScConversion>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getMessageCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, {
      headers: this.getAuthHeaders()
    });
  }
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      headers: this.getAuthHeaders()
  });
  }
}
