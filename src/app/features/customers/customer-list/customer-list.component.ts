import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filter properties
  searchTerm = '';
  showInactiveCustomers = false;
  
  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers', error);
        this.errorMessage = 'Error loading customers. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      // Apply search term filter
      const matchesSearch = this.searchTerm === '' || 
        customer.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(this.searchTerm));

      // Apply active/inactive filter
      const matchesStatus = this.showInactiveCustomers || customer.isActive !== false;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.showInactiveCustomers = false;
    this.applyFilters();
  }

  deleteCustomer(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== id);
          this.applyFilters();
        },
        error: (error) => console.error('Error deleting customer', error)
      });
    }
  }

  deactivateCustomer(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to deactivate this customer?')) {
      this.customerService.deactivateCustomer(id).subscribe({
        next: () => {
          // Update the customer in the local array
          const customerIndex = this.customers.findIndex(c => c.id === id);
          if (customerIndex !== -1) {
            this.customers[customerIndex].isActive = false;
            this.applyFilters();
          }
        },
        error: (error) => console.error('Error deactivating customer', error)
      });
    }
  }
}