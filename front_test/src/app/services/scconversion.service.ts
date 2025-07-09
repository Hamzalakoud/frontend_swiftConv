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
export class ScConversionService {
  private apiUrl = '/api/sc-conversion';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  /**
   * Get all conversion files.
   * @returns {Observable<ScConversion[]>} List of conversion files.
   */
  getFiles(): Observable<ScConversion[]> {
    return this.http.get<ScConversion[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get filtered conversion files based on provided filter parameters.
   * @param filter The filter criteria.
   * @returns {Observable<ScConversion[]>} List of filtered conversion files.
   */
  getFilteredFiles(filter: any): Observable<ScConversion[]> {
    const params = new URLSearchParams();

    // Append filter criteria to URL parameters
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

  /**
   * Get a specific conversion file by ID.
   * @param id The ID of the conversion file.
   * @returns {Observable<ScConversion>} The conversion file object.
   */
  getFileById(id: number): Observable<ScConversion> {
    return this.http.get<ScConversion>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get the total count of conversion messages.
   * @returns {Observable<number>} The total count of conversion messages.
   */
  getMessageCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get dashboard statistics for the conversions.
   * @returns {Observable<any>} The dashboard stats object.
   */
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Add a new ScConversion file.
   * @param conversion The ScConversion object to be added.
   * @returns {Observable<ScConversion>} The created ScConversion object.
   */
  addFile(conversion: ScConversion): Observable<ScConversion> {
    return this.http.post<ScConversion>(this.apiUrl, conversion, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update an existing ScConversion file.
   * @param id The ID of the conversion file.
   * @param conversion The updated ScConversion object.
   * @returns {Observable<ScConversion>} The updated ScConversion object.
   */
  updateFile(id: number, conversion: ScConversion): Observable<ScConversion> {
    return this.http.put<ScConversion>(`${this.apiUrl}/${id}`, conversion, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete a specific ScConversion file.
   * @param id The ID of the conversion file.
   * @returns {Observable<any>} The result of the delete operation.
   */
  deleteFile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
