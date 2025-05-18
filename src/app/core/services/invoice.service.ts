import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { PaymentStatus } from '../models/enums/payment-status.enum';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8083/api/invoices';

  constructor(private http: HttpClient) { }

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  getInvoiceByOrderId(orderId: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/order/${orderId}`);
  }

  getInvoiceByNumber(invoiceNumber: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/number/${invoiceNumber}`);
  }

  getInvoicesByPaymentStatus(paymentStatus: PaymentStatus): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/status/${paymentStatus}`);
  }

  getOverdueInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/overdue`);
  }

  updateInvoicePaymentStatus(id: number, paymentStatus: PaymentStatus): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/payment`, null, {
      params: new HttpParams().set('paymentStatus', paymentStatus)
    });
  }
}