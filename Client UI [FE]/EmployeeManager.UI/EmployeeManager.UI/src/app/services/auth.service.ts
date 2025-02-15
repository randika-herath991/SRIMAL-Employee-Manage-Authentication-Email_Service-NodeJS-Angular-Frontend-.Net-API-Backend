import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Admin } from '../models/admin.model';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.baseApiUrl}/api/auth/login`;
  baseApiUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  login(adminEmail: string, adminPassword: string): Observable<Admin[]> {
    return this.http.post<Admin[]>(this.apiUrl, { adminEmail, adminPassword });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPassword');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getProtectedData(): Observable<any> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${environment.baseApiUrl}/api/protected-endpoint`, { headers });
  }

  forgotPassword(adminEmail: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(`${this.baseApiUrl}/api/auth/forgotpassword`, JSON.stringify(adminEmail), { headers, responseType: 'text' as 'json' }).pipe(
      catchError(error => {
        console.error('Error sending email', error);
        return throwError(error);
      })
    );
  }


}