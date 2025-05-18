import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  
  // Sample categories - in a real app, these might come from an API
  categories = [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Books', 
    'Toys', 'Sports', 'Automotive', 'Office Supplies'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      imageUrl: [''],
      sku: ['']
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.patchFormValues(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product', error);
        this.errorMessage = 'Error loading product. Please try again.';
        this.isLoading = false;
      }
    });
  }

  patchFormValues(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      imageUrl: product.imageUrl,
      sku: product.sku
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return this.markFormGroupTouched(this.productForm);
    }

    const productData: Product = this.productForm.value;
    this.isSubmitting = true;
    
    if (this.isEditMode && this.productId) {
      this.updateProduct(this.productId, productData);
    } else {
      this.createProduct(productData);
    }
  }

  createProduct(product: Product): void {
    this.productService.createProduct(product).subscribe({
      next: (createdProduct) => {
        this.isSubmitting = false;
        this.router.navigate(['/products', createdProduct.id]);
      },
      error: (error) => {
        console.error('Error creating product', error);
        this.errorMessage = 'Error creating product. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  updateProduct(id: number, product: Product): void {
    this.productService.updateProduct(id, product).subscribe({
      next: (updatedProduct) => {
        this.isSubmitting = false;
        this.router.navigate(['/products', updatedProduct.id]);
      },
      error: (error) => {
        console.error('Error updating product', error);
        this.errorMessage = 'Error updating product. Please try again.';
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
    return this.productForm.controls;
  }
}