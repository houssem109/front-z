import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-low-stock-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './low-stock-products.component.html',
  styleUrls: ['./low-stock-products.component.scss']
})
export class LowStockProductsComponent implements OnInit {
  lowStockProducts: Product[] = [];
  isLoading = true;
  errorMessage = '';
  thresholdValue = 10; // Default threshold

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadLowStockProducts();
  }

  loadLowStockProducts(): void {
    this.isLoading = true;
    this.productService.getLowStockProducts(this.thresholdValue).subscribe({
      next: (products) => {
        this.lowStockProducts = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading low stock products', error);
        this.errorMessage = 'Error loading low stock products. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updateThreshold(): void {
    this.loadLowStockProducts();
  }
}