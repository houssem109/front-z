import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;
  customerId?: number;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  
  // Sample countries - in a real app, these might come from an API
  countries = [
    'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 
    'Italy', 'Spain', 'Australia', 'Japan', 'China', 'Brazil', 'India'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = +params['id'];
        this.loadCustomer(this.customerId);
      }
    });
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      notes: [''],
      isActive: [true]
    });
  }

  loadCustomer(id: number): void {
    this.isLoading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.patchFormValues(customer);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customer', error);
        this.errorMessage = 'Error loading customer. Please try again.';
        this.isLoading = false;
      }
    });
  }

  patchFormValues(customer: Customer): void {
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      country: customer.country,
      notes: customer.notes,
      isActive: customer.isActive
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      return this.markFormGroupTouched(this.customerForm);
    }

    const customerData: Customer = this.customerForm.value;
    this.isSubmitting = true;
    
    if (this.isEditMode && this.customerId) {
      this.updateCustomer(this.customerId, customerData);
    } else {
      this.createCustomer(customerData);
    }
  }

  createCustomer(customer: Customer): void {
    this.customerService.createCustomer(customer).subscribe({
      next: (createdCustomer) => {
        this.isSubmitting = false;
        this.router.navigate(['/customers', createdCustomer.id]);
      },
      error: (error) => {
        console.error('Error creating customer', error);
        this.errorMessage = 'Error creating customer. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  updateCustomer(id: number, customer: Customer): void {
    this.customerService.updateCustomer(id, customer).subscribe({
      next: (updatedCustomer) => {
        this.isSubmitting = false;
        this.router.navigate(['/customers', updatedCustomer.id]);
      },
      error: (error) => {
        console.error('Error updating customer', error);
        this.errorMessage = 'Error updating customer. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  get f() {
    return this.customerForm.controls;
  }
}