// src/app/features/orders/order-status-update/order-status-update.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { OrderStatus } from '../../../core/models/enums/order-status.enum';

@Component({
  selector: 'app-order-status-update',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './order-status-update.component.html',
  styleUrls: ['./order-status-update.component.scss']
})
export class OrderStatusUpdateComponent implements OnInit {
  order: Order | null = null;
  statusForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  
  // For template access to enum values
  orderStatusValues = Object.values(OrderStatus);
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
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

  initializeForm(): void {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      notes: ['']
    });
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.statusForm.patchValue({
          status: order.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order', error);
        this.errorMessage = 'Error loading order. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.statusForm.invalid) {
      Object.keys(this.statusForm.controls).forEach(key => {
        this.statusForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.order || !this.order.id) return;
    
    const newStatus = this.statusForm.get('status')?.value;
    if (!newStatus) return;
    
    this.isSubmitting = true;
    
    this.orderService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.isSubmitting = false;
        
        // Add notes to order if provided
        const notes = this.statusForm.get('notes')?.value;
        if (notes) {
          updatedOrder.notes = notes;
          this.orderService.updateOrderStatus(this.order!.id!, updatedOrder.status!).subscribe();
        }
        
        this.router.navigate(['/orders', this.order?.id]);
      },
      error: (error) => {
        console.error('Error updating order status', error);
        this.errorMessage = 'Error updating order status. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  getOrderStatusClass(status: OrderStatus): string {
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