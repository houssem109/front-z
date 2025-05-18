import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  
  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    // Extract unique categories from products
    this.categories = Array.from(new Set(this.products
      .filter(p => p.category)
      .map(p => p.category as string)));
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Apply search term filter
      const matchesSearch = this.searchTerm === '' || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Apply category filter
      const matchesCategory = this.selectedCategory === '' || 
        product.category === this.selectedCategory;

      // Apply price range filter
      const aboveMinPrice = this.minPrice === null || 
        product.price >= this.minPrice;
      const belowMaxPrice = this.maxPrice === null || 
        product.price <= this.maxPrice;

      return matchesSearch && matchesCategory && aboveMinPrice && belowMaxPrice;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.filteredProducts = [...this.products];
  }

  deleteProduct(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.filteredProducts = this.filteredProducts.filter(p => p.id !== id);
        },
        error: (error) => console.error('Error deleting product', error)
      });
    }
  }
}