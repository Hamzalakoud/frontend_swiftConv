import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScMxFile {
  id: number;
  filename: string;
  messageType: string;
  mxMsg: string;
  status: string;
  creationDate: string;
  updateDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScMxFileService {

  private apiUrl = '/api/sc-mx-file';  // base URL for your backend endpoint

  constructor(private http: HttpClient) {}

    getFiles(): Observable<ScMxFile[]> {
      const token = localStorage.getItem('authToken') || '';
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      return this.http.get<ScMxFile[]>('/api/sc-mx-file', { headers });
    }

    getFileById(id: number): Observable<ScMxFile> {
      const token = localStorage.getItem('authToken') || '';
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      return this.http.get<ScMxFile>(`/api/sc-mx-file/${id}`, { headers });
    }

}
