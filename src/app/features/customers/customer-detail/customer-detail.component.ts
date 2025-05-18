// src/app/features/customers/customer-detail/customer-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { OrderService } from '../../../core/services/order.service';
import { Customer } from '../../../core/models/customer.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit {
  customer: Customer | null = null;
  customerOrders: Order[] = [];
  isLoading = {
    customer: true,
    orders: true
  };
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCustomer(+id);
        this.loadCustomerOrders(+id);
      } else {
        this.errorMessage = 'Customer ID is missing';
        this.isLoading.customer = false;
      }
    });
  }

  loadCustomer(id: number): void {
    this.isLoading.customer = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.isLoading.customer = false;
      },
      error: (error) => {
        console.error('Error loading customer', error);
        this.errorMessage = 'Error loading customer. Please try again.';
        this.isLoading.customer = false;
      }
    });
  }

  loadCustomerOrders(customerId: number): void {
    this.isLoading.orders = true;
    this.orderService.getOrdersByCustomerId(customerId).subscribe({
      next: (orders) => {
        this.customerOrders = orders;
        this.isLoading.orders = false;
      },
      error: (error) => {
        console.error('Error loading customer orders', error);
        this.isLoading.orders = false;
      }
    });
  }

  deleteCustomer(): void {
    if (!this.customer || !this.customer.id) return;
    
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(this.customer.id).subscribe({
        next: () => {
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          console.error('Error deleting customer', error);
          this.errorMessage = 'Error deleting customer. Please try again.';
        }
      });
    }
  }

  deactivateCustomer(): void {
    if (!this.customer || !this.customer.id) return;
    
    if (confirm('Are you sure you want to deactivate this customer?')) {
      this.customerService.deactivateCustomer(this.customer.id).subscribe({
        next: () => {
          if (this.customer) {
            this.customer.isActive = false;
          }
        },
        error: (error) => {
          console.error('Error deactivating customer', error);
          this.errorMessage = 'Error deactivating customer. Please try again.';
        }
      });
    }
  }
}