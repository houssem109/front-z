import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { OrderStatus } from '../../../core/models/enums/order-status.enum';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filter properties
  selectedOrderStatus = '';
  selectedPaymentStatus = '';
  fromDate: string | null = null;
  toDate: string | null = null;
  
  // For template access to enum values
  orderStatusValues = Object.values(OrderStatus);
  paymentStatusValues = Object.values(PaymentStatus);
  
  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders', error);
        this.errorMessage = 'Error loading orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Apply order status filter
      const matchesOrderStatus = this.selectedOrderStatus === '' || 
        order.status === this.selectedOrderStatus;

      // Apply payment status filter
      const matchesPaymentStatus = this.selectedPaymentStatus === '' || 
        order.paymentStatus === this.selectedPaymentStatus;

      // Apply date range filter
      let matchesDateRange = true;
      if (order.orderDate) {
        const orderDate = new Date(order.orderDate);
        if (this.fromDate) {
          const fromDateObj = new Date(this.fromDate);
          matchesDateRange = matchesDateRange && orderDate >= fromDateObj;
        }
        if (this.toDate) {
          const toDateObj = new Date(this.toDate);
          // Set time to end of day for to-date
          toDateObj.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && orderDate <= toDateObj;
        }
      }

      return matchesOrderStatus && matchesPaymentStatus && matchesDateRange;
    });
  }

  clearFilters(): void {
    this.selectedOrderStatus = '';
    this.selectedPaymentStatus = '';
    this.fromDate = null;
    this.toDate = null;
    this.filteredOrders = [...this.orders];
  }

  deleteOrder(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== id);
          this.filteredOrders = this.filteredOrders.filter(o => o.id !== id);
        },
        error: (error) => console.error('Error deleting order', error)
      });
    }
  }

  getOrderStatusClass(status: OrderStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-warning';
      case OrderStatus.PROCESSING:
        return 'bg-info';
      case OrderStatus.SHIPPED:
        return 'bg-primary';
      case OrderStatus.DELIVERED:
        return 'bg-success';
      case OrderStatus.CANCELLED:
        return 'bg-danger';
      case OrderStatus.RETURNED:
        return 'bg-secondary';
      default:
        return 'bg-light';
    }
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
}