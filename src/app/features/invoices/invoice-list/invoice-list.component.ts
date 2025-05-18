// src/app/features/invoices/invoice-list/invoice-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filter properties
  selectedPaymentStatus = '';
  showOverdueOnly = false;
  invoiceNumber = '';
  
  // For template access to enum values
  paymentStatusValues = Object.values(PaymentStatus);
  
  constructor(private invoiceService: InvoiceService) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.filteredInvoices = [...invoices];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices', error);
        this.errorMessage = 'Error loading invoices. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      // Apply payment status filter
      const matchesPaymentStatus = this.selectedPaymentStatus === '' || 
        invoice.paymentStatus === this.selectedPaymentStatus;

      // Apply overdue filter
      let matchesOverdue = true;
      if (this.showOverdueOnly) {
        const today = new Date();
        const dueDate = new Date(invoice.dueDate || '');
        matchesOverdue = dueDate < today && invoice.paymentStatus !== PaymentStatus.PAID;
      }

      // Apply invoice number filter
      const matchesInvoiceNumber = this.invoiceNumber === '' || 
        invoice.invoiceNumber?.toLowerCase().includes(this.invoiceNumber.toLowerCase());

      return matchesPaymentStatus && matchesOverdue && matchesInvoiceNumber;
    });
  }

  clearFilters(): void {
    this.selectedPaymentStatus = '';
    this.showOverdueOnly = false;
    this.invoiceNumber = '';
    this.filteredInvoices = [...this.invoices];
  }

  getPaymentStatusClass(status: PaymentStatus): string {
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
}