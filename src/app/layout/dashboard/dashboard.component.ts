// src/app/layout/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';
import { Invoice } from '../../core/models/invoice.model';
import { OrderStatus } from '../../core/models/enums/order-status.enum';
import { PaymentStatus } from '../../core/models/enums/payment-status.enum';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  lowStockProducts: Product[] = [];
  recentOrders: Order[] = [];
  overdueInvoices: Invoice[] = [];
  
  totalProducts = 0;
  totalCustomers = 0;
  totalOrders = 0;
  totalRevenue = 0;

  isLoading = {
    lowStock: true,
    recentOrders: true,
    overdueInvoices: true,
    summaryData: true
  };

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load summary data
    this.loadSummaryData();
    
    // Load specific sections
    this.loadLowStockProducts();
    this.loadRecentOrders();
    this.loadOverdueInvoices();
  }

  loadSummaryData(): void {
    this.isLoading.summaryData = true;
    
    // Use forkJoin to make multiple API calls in parallel
    forkJoin({
      products: this.productService.getAllProducts(),
      customers: this.customerService.getAllCustomers(),
      orders: this.orderService.getAllOrders()
    }).subscribe({
      next: (results) => {
        // Count total products
        this.totalProducts = results.products.length;
        
        // Count total customers
        this.totalCustomers = results.customers.length;
        
        // Count total orders
        this.totalOrders = results.orders.length;
        
        // Calculate total revenue from completed orders
        this.totalRevenue = results.orders
          .filter(order => 
            order.status === OrderStatus.DELIVERED && 
            order.paymentStatus === PaymentStatus.PAID
          )
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        this.isLoading.summaryData = false;
      },
      error: (error) => {
        console.error('Error loading summary data', error);
        this.isLoading.summaryData = false;
      }
    });
  }

  loadLowStockProducts(): void {
    this.isLoading.lowStock = true;
    this.productService.getLowStockProducts(10).subscribe({
      next: (products) => {
        this.lowStockProducts = products;
        this.isLoading.lowStock = false;
      },
      error: (error) => {
        console.error('Error loading low stock products', error);
        this.isLoading.lowStock = false;
      }
    });
  }

  loadRecentOrders(): void {
    this.isLoading.recentOrders = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        // Sort by date descending and take the first 5
        this.recentOrders = orders
          .sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
          .slice(0, 5);
        this.isLoading.recentOrders = false;
      },
      error: (error) => {
        console.error('Error loading recent orders', error);
        this.isLoading.recentOrders = false;
      }
    });
  }

  loadOverdueInvoices(): void {
    this.isLoading.overdueInvoices = true;
    this.invoiceService.getOverdueInvoices().subscribe({
      next: (invoices) => {
        this.overdueInvoices = invoices;
        this.isLoading.overdueInvoices = false;
      },
      error: (error) => {
        console.error('Error loading overdue invoices', error);
        this.isLoading.overdueInvoices = false;
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
}