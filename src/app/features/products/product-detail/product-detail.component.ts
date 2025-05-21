import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(+id);
      } else {
        this.errorMessage = 'Product ID is missing';
        this.isLoading = false;
      }
    });
  }

  loadProduct(id: number ): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product', error);
        this.errorMessage = 'Error loading product. Please try again.';
        this.isLoading = false;
      }
    });
  }

  deleteProduct(): void {
    if (!this.product || !this.product.id) return;
    
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error deleting product', error);
          this.errorMessage = 'Error deleting product. Please try again.';
        }
      });
    }
  }

  getStockStatusClass(): string {
    if (!this.product) return '';
    
    if (this.product.stockQuantity <= 0) {
      return 'bg-danger';
    } else if (this.product.stockQuantity < 10) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }

  getStockStatusText(): string {
    if (!this.product) return '';
    
    if (this.product.stockQuantity <= 0) {
      return 'Out of Stock';
    } else if (this.product.stockQuantity < 10) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }
}