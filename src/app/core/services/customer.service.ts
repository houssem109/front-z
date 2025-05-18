import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8082/api/customers';
  private wsBaseUrl = 'ws://localhost:8082';

  constructor(private http: HttpClient) { }

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  getActiveCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/active`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deactivateCustomer(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  searchCustomers(term: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('term', term)
    });
  }

  autocompleteCustomers(term: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/autocomplete`, {
      params: new HttpParams().set('term', term)
    });
  }

  // WebSocket connection for real-time autocomplete
  createWebSocketConnection(): WebSocket {
    return new WebSocket(`${this.wsBaseUrl}/ws`);
  }
}