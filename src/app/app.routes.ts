// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { DashboardComponent } from './layout/dashboard/dashboard.component';

// Product routes
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { LowStockProductsComponent } from './features/products/low-stock-products/low-stock-products.component';

// Customer routes
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { CustomerDetailComponent } from './features/customers/customer-detail/customer-detail.component';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';

// Order routes
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';
import { OrderFormComponent } from './features/orders/order-form/order-form.component';
import { OrderStatusUpdateComponent } from './features/orders/order-status-update/order-status-update.component';

// Invoice routes
import { InvoiceListComponent } from './features/invoices/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './features/invoices/invoice-detail/invoice-detail.component';
import { InvoicePaymentComponent } from './features/invoices/invoice-payment/invoice-payment.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  
  // Product routes
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'low-stock', component: LowStockProductsComponent },
  
  // Customer routes
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/edit/:id', component: CustomerFormComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  
  // Order routes
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/new', component: OrderFormComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'orders/status/:id', component: OrderStatusUpdateComponent },
  
  // Invoice routes
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoices/:id', component: InvoiceDetailComponent },
  { path: 'invoices/:id/payment', component: InvoicePaymentComponent },
  
  // Wildcard route for 404
  { path: '**', redirectTo: 'dashboard' }
];