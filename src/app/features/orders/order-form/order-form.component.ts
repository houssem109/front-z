// src/app/features/orders/order-form/order-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { Order } from '../../../core/models/order.model';
import { Customer } from '../../../core/models/customer.model';
import { Product } from '../../../core/models/product.model';
import { OrderStatus } from '../../../core/models/enums/order-status.enum';
import { PaymentStatus } from '../../../core/models/enums/payment-status.enum';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  isLoading = {
    customers: true,
    products: true,
    form: false
  };
  isSubmitting = false;
  errorMessage = '';
  
  customers: Customer[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProducts: { [id: number]: Product } = {};
  
  // For template access to enums
  orderStatusValues = Object.values(OrderStatus);
  paymentStatusValues = Object.values(PaymentStatus);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
  this.initializeForm();
  this.loadCustomers();
  this.loadProducts();
  
  // Check if customer ID is in query params (for creating an order for a specific customer)
  this.route.queryParams.subscribe(params => {
    if (params['customerId']) {
      const customerId = +params['customerId'];
      this.orderForm.patchValue({ customerId });
      this.updateCustomerDetails(customerId); // Call the new method
    }
  });
}

  initializeForm(): void {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      status: [OrderStatus.PENDING],
      paymentStatus: [PaymentStatus.PENDING],
      paymentMethod: [''],
      shippingAddress: [''],
      billingAddress: [''],
      notes: [''],
      items: this.fb.array([])
    });

    // Add first empty item by default
    this.addItem();
  }

  loadCustomers(): void {
    this.isLoading.customers = true;
    this.customerService.getActiveCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading.customers = false;
      },
      error: (error) => {
        console.error('Error loading customers', error);
        this.errorMessage = 'Error loading customers. Please try again.';
        this.isLoading.customers = false;
      }
    });
  }

  loadProducts(): void {
    this.isLoading.products = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.filter(product => product.stockQuantity > 0);
        this.filteredProducts = [...this.products];
        this.isLoading.products = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.errorMessage = 'Error loading products. Please try again.';
        this.isLoading.products = false;
      }
    });
  }

 onCustomerChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const customerId = +selectElement.value;
  this.updateCustomerDetails(customerId);
}

// New method for direct customer ID use
updateCustomerDetails(customerId: number): void {
  const customer = this.customers.find(c => c.id === customerId);
  
  if (customer) {
    let address = '';
    
    if (customer.address) {
      address += customer.address + '\n';
    }
    
    if (customer.city || customer.state || customer.zipCode) {
      address += customer.city || '';
      address += customer.city && customer.state ? ', ' : '';
      address += customer.state || '';
      address += ' ' + (customer.zipCode || '');
      address += '\n';
    }
    
    if (customer.country) {
      address += customer.country;
    }
    
    this.orderForm.patchValue({
      shippingAddress: address.trim(),
      billingAddress: address.trim()
    });
  }
}
  // Form Array Management for Order Items
  get itemsFormArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    this.itemsFormArray.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        price: [{value: 0, disabled: true}],
        totalPrice: [{value: 0, disabled: true}]
      })
    );
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
  }

 onProductChange(index: number, event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const productId = selectElement.value;
  
  if (!productId) return;
  
  const id = +productId;
  const product = this.products.find(p => p.id === id);
  
  if (product) {
    this.selectedProducts[id] = product;
    
    const itemGroup = this.itemsFormArray.at(index);
    itemGroup.patchValue({
      price: product.price,
      quantity: 1,
      totalPrice: product.price
    });
    
    this.updateOrderTotals();
  }
}

 onQuantityChange(index: number, event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const quantity = +inputElement.value;
  
  const itemGroup = this.itemsFormArray.at(index);
  const productId = itemGroup.get('productId')?.value;
  
  if (productId) {
    const product = this.selectedProducts[+productId];
    if (product) {
      const totalPrice = quantity * product.price;
      itemGroup.patchValue({
        totalPrice: totalPrice
      });
      
      this.updateOrderTotals();
    }
  }
}

  updateOrderTotals(): void {
    // This would be calculated on the backend, but we can still show a preview
    let subtotal = 0;
    
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      const itemGroup = this.itemsFormArray.at(i);
      const totalPrice = itemGroup.get('totalPrice')?.value || 0;
      subtotal += totalPrice;
    }
    
    // In a real app, you might calculate tax based on address and rules
    const taxRate = 0.1; // 10% tax rate for example
    const tax = subtotal * taxRate;
    
    // Shipping might be calculated based on weight, distance, etc.
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping for orders over $100
    
    const totalAmount = subtotal + tax + shippingCost;
    
    // These fields would be set by the backend, but we show estimated values
    this.orderForm.patchValue({
      subtotal,
      tax,
      shippingCost,
      totalAmount
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm);
      return;
    }

    // Enable disabled controls temporarily for form submission
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      const itemGroup = this.itemsFormArray.at(i);
      itemGroup.get('price')?.enable();
      itemGroup.get('totalPrice')?.enable();
    }

    const orderData: Order = {
      ...this.orderForm.value,
      orderDate: new Date(),
    };

    this.isSubmitting = true;
    
    this.orderService.createOrder(orderData).subscribe({
      next: (createdOrder) => {
        this.isSubmitting = false;
        this.router.navigate(['/orders', createdOrder.id]);
      },
      error: (error) => {
        console.error('Error creating order', error);
        this.errorMessage = 'Error creating order. Please try again.';
        this.isSubmitting = false;
        
        // Re-disable the controls
        for (let i = 0; i < this.itemsFormArray.length; i++) {
          const itemGroup = this.itemsFormArray.at(i);
          itemGroup.get('price')?.disable();
          itemGroup.get('totalPrice')?.disable();
        }
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getCustomerNameById(id: number): string {
    const customer = this.customers.find(c => c.id === id);
    return customer ? `${customer.firstName} ${customer.lastName}` : '';
  }

  searchProducts(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const term = inputElement.value;
  
  if (!term) {
    this.filteredProducts = [...this.products];
    return;
  }
  
  const searchTerm = term.toLowerCase();
  this.filteredProducts = this.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
    (product.category && product.category.toLowerCase().includes(searchTerm))
  );
}
}