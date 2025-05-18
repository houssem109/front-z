// src/app/features/orders/order-detail/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { OrderStatus } from '../../../core/models/enums/order-status.enum';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
    OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  order: Order | null = null;
  isLoading = true;
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadOrder(+id);
      } else {
        this.errorMessage = 'Order ID is missing';
        this.isLoading = false;
      }
    });
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order', error);
        this.errorMessage = 'Error loading order. Please try again.';
        this.isLoading = false;
      }
    });
  }

  deleteOrder(): void {
    if (!this.order || !this.order.id) return;
    
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(this.order.id).subscribe({
        next: () => {
          this.router.navigate(['/orders']);
        },
        error: (error) => {
          console.error('Error deleting order', error);
          this.errorMessage = 'Error deleting order. Please try again.';
        }
      });
    }
  }

  updateOrderStatus(status: OrderStatus): void {
    if (!this.order || !this.order.id) return;
    
    this.orderService.updateOrderStatus(this.order.id, status).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
      },
      error: (error) => {
        console.error('Error updating order status', error);
        this.errorMessage = 'Error updating order status. Please try again.';
      }
    });
  }

  updatePaymentStatus(status: PaymentStatus): void {
    if (!this.order || !this.order.id) return;
    
    this.orderService.updatePaymentStatus(this.order.id, status).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
      },
      error: (error) => {
        console.error('Error updating payment status', error);
        this.errorMessage = 'Error updating payment status. Please try again.';
      }
    });
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

  calculateSubtotal(): number {
    if (!this.order || !this.order.items) return 0;
    
    return this.order.items.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  }
  isStatusCompleted(status: string, currentStatus: OrderStatus | undefined): boolean {
    if (!currentStatus) return false;
    
    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED
    ];
    
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(currentStatus)) {
      return false;
    }
    
    const statusIndex = statusOrder.indexOf(status as OrderStatus);
    const currentStatusIndex = statusOrder.indexOf(currentStatus);
    
    return statusIndex < currentStatusIndex;
  }
}