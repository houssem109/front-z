import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    { 
      title: 'Dashboard', 
      icon: 'bi-speedometer2', 
      route: '/dashboard' 
    },
    { 
      title: 'Products', 
      icon: 'bi-box-seam', 
      route: '/products',
      subItems: [
        { title: 'All Products', route: '/products' },
        { title: 'Add Product', route: '/products/new' },
        { title: 'Low Stock', route: '/products/low-stock' }
      ]
    },
    { 
      title: 'Customers', 
      icon: 'bi-people', 
      route: '/customers',
      subItems: [
        { title: 'All Customers', route: '/customers' },
        { title: 'Add Customer', route: '/customers/new' }
      ]
    },
    { 
      title: 'Orders', 
      icon: 'bi-cart3', 
      route: '/orders',
      subItems: [
        { title: 'All Orders', route: '/orders' },
        { title: 'Create Order', route: '/orders/new' }
      ]
    },
    { 
      title: 'Invoices', 
      icon: 'bi-receipt', 
      route: '/invoices' 
    }
  ];

  expandedMenuIndex: number | null = null;

  toggleSubmenu(index: number): void {
    this.expandedMenuIndex = this.expandedMenuIndex === index ? null : index;
  }

  isMenuExpanded(index: number): boolean {
    return this.expandedMenuIndex === index;
  }
}