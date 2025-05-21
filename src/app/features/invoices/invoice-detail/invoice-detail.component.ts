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
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent implements OnInit {
  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  invoice: Invoice | null = null;
  order: Order | null = null;
  isLoading = {
    invoice: true,
    order: true,
  };
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
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
      },
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
      },
    });
  }

  updatePaymentStatus(status: PaymentStatus): void {
    if (!this.invoice || !this.invoice.id) return;

    this.invoiceService
      .updateInvoicePaymentStatus(this.invoice.id, status)
      .subscribe({
        next: (updatedInvoice) => {
          this.invoice = updatedInvoice;
        },
        error: (error) => {
          console.error('Error updating payment status', error);
          this.errorMessage =
            'Error updating payment status. Please try again.';
        },
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
    if (!this.invoice || !this.order) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }

    // Get the invoice container content
    const invoiceContainer = document.querySelector('.invoice-container');
    if (!invoiceContainer) return;

    // Create HTML content for the new window
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${this.invoice.invoiceNumber}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-header {
          margin-bottom: 30px;
        }
        .company-name {
          color: #4361ee;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-title {
          color: #4361ee;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-number {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -15px;
        }
        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
          padding: 0 15px;
          box-sizing: border-box;
        }
        .text-md-end {
          text-align: right;
        }
        .invoice-dates {
          margin-bottom: 30px;
          padding: 15px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }
        .date-label {
          font-weight: bold;
          color: #666;
        }
        .date-value {
          font-size: 16px;
        }
        .info-title {
          font-weight: bold;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        .customer-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 5px;
        }
        .detail-label {
          font-weight: bold;
          width: 130px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .text-end {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        tfoot td {
          font-weight: bold;
          border-top: 2px solid #ddd;
        }
        .table-total td {
          font-size: 18px;
        }
        .notes-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
        }
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${invoiceContainer.outerHTML}
      <script>
        window.onload = function() {
          // Remove any print-hide elements
          const hideElements = document.querySelectorAll('.print-hide');
          hideElements.forEach(el => el.remove());
          
          // Show any print-only elements
          const showElements = document.querySelectorAll('.print-only');
          showElements.forEach(el => el.style.display = 'block');
          
          // Print after a short delay
          setTimeout(() => {
            window.print();
            // Close the window after printing (optional)
            // window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
