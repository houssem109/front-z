import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/api/products';

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchProducts(name?: string, category?: string, minPrice?: number, maxPrice?: number): Observable<Product[]> {
    let params = new HttpParams();
    
    if (name) params = params.set('name', name);
    if (category) params = params.set('category', category);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`, {
      params: new HttpParams().set('threshold', threshold.toString())
    });
  }
}