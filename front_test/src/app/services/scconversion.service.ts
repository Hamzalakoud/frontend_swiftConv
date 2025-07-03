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
  msgOrigMT: string | null;   // Correct types for msgOrigMT and msgOrigMX
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
export class ScConversionService {

  private apiUrl = '/api/sc-conversion';  // base URL for your backend endpoint

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
}
