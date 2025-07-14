import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
export class ScConversionService {
  // Make sure to replace this URL if your backend URL or port is different
  private apiUrl = 'http://localhost:8080/api/sc-conversion';

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
    let params = new HttpParams();

    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<ScConversion[]>(`${this.apiUrl}/filtered`, {
      headers: this.getAuthHeaders(),
      params: params
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

  addFile(conversion: ScConversion): Observable<ScConversion> {
    return this.http.post<ScConversion>(this.apiUrl, conversion, {
      headers: this.getAuthHeaders()
    });
  }

  updateFile(id: number, conversion: ScConversion): Observable<ScConversion> {
    return this.http.put<ScConversion>(`${this.apiUrl}/${id}`, conversion, {
      headers: this.getAuthHeaders()
    });
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
