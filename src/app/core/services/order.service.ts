import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/enums/order-status.enum';
import { PaymentStatus } from '../models/enums/payment-status.enum';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8083/api/orders';

  constructor(private http: HttpClient) { }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrdersByCustomerId(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/payment`, null, {
      params: new HttpParams().set('paymentStatus', paymentStatus)
    });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}