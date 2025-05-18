// src/app/features/invoices/invoice-detail/invoice-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { OrderService } from '../../../core/services/order.service';
import { Invoice } from '../../../core/models/invoice.model';
import { Order } from '../../../core/models/order.model';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';
import { OrderStatus } from '../../../core/models/enums/order-status.enum';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
     OrderStatus = OrderStatus;
    PaymentStatus = PaymentStatus;
  invoice: Invoice | null = null;
  order: Order | null = null;
  isLoading = {
    invoice: true,
    order: true
  };
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadInvoice(+id);
      } else {
        this.errorMessage = 'Invoice ID is missing';
        this.isLoading.invoice = false;
      }
    });
  }

  loadInvoice(id: number): void {
    this.isLoading.invoice = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.isLoading.invoice = false;
        
        if (invoice.orderId) {
          this.loadOrder(invoice.orderId);
        } else {
          this.isLoading.order = false;
        }
      },
      error: (error) => {
        console.error('Error loading invoice', error);
        this.errorMessage = 'Error loading invoice. Please try again.';
        this.isLoading.invoice = false;
      }
    });
  }

  loadOrder(orderId: number): void {
    this.isLoading.order = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading.order = false;
      },
      error: (error) => {
        console.error('Error loading order', error);
        this.isLoading.order = false;
      }
    });
  }

  updatePaymentStatus(status: PaymentStatus): void {
    if (!this.invoice || !this.invoice.id) return;
    
    this.invoiceService.updateInvoicePaymentStatus(this.invoice.id, status).subscribe({
      next: (updatedInvoice) => {
        this.invoice = updatedInvoice;
      },
      error: (error) => {
        console.error('Error updating payment status', error);
        this.errorMessage = 'Error updating payment status. Please try again.';
      }
    });
  }

  getPaymentStatusClass(status: PaymentStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case PaymentStatus.PENDING:
        return 'bg-warning';
      case PaymentStatus.PAID:
        return 'bg-success';
      case PaymentStatus.FAILED:
        return 'bg-danger';
      case PaymentStatus.REFUNDED:
        return 'bg-info';
      default:
        return 'bg-light';
    }
  }

  isInvoiceOverdue(invoice: Invoice): boolean {
    if (!invoice.dueDate || invoice.paymentStatus === PaymentStatus.PAID) {
      return false;
    }
    
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return dueDate < today;
  }

  printInvoice(): void {
    window.print();
  }
}