import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Employee } from '../models/employee.model';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  baseApiUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) { }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseApiUrl + '/api/employeement').pipe(
      catchError(error => {
        console.error('Error fetching employees', error);
        return throwError(error);
      })
    );
  }

  addEmployee(addEmployeeRequest: Employee): Observable<Employee> {
    addEmployeeRequest.id = '00000000-0000-0000-0000-000000000000';
    return this.http.post<Employee>(this.baseApiUrl + '/api/employeement', addEmployeeRequest).pipe(
      catchError(error => {
        if (error.status === 400) {
          if (error.error.message === "Email already exists.") {
            return throwError("Email already exists.");
          }
          if (error.error.message === "Password already exists.") {
            return throwError("Password already exists.");
          }
        }
        console.error('Error adding employee', error);
        return throwError("An unexpected error occurred.");
      })
    );
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(this.baseApiUrl + '/api/employeement/' + id).pipe(
      catchError(error => {
        console.error('Error fetching employee', error);
        return throwError(error);
      })
    );
  }

  updateEmployee(id: string, updateEmployeeRequest: Employee): Observable<Employee> {
    return this.http.put<Employee>(this.baseApiUrl + '/api/employeement/' + id, updateEmployeeRequest).pipe(
      catchError(error => {
        if (error.status === 400) {
          if (error.error.message === "Email already exists.") {
            return throwError("Email already exists.");
          }
          if (error.error.message === "Password already exists.") {
            return throwError("Password already exists.");
          }
        }
        console.error('Error updating employee', error);
        return throwError(error);
      })
    );
  }

  deleteEmployee(id: string): Observable<Employee> {
    return this.http.delete<Employee>(this.baseApiUrl + '/api/employeement/' + id).pipe(
      catchError(error => {
        console.error('Error deleting employee', error);
        return throwError(error);
      })
    );
  }

  toggleEmployeeStatus(id: string): Observable<Employee> {
    return this.http.patch<Employee>(this.baseApiUrl + '/api/employeement/' + id + '/toggle-status', {}).pipe(
      catchError(error => {
        console.error('Error toggling employee status', error);
        return throwError(error);
      })
    );
  }
}