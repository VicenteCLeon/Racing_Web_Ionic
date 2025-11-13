import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId?: number;
  imageUrl?: string;
  image?: string;
  stock?: number;
  size?: string;
  brand?: string;
  color?: string;
  isActive?: boolean;
  type?: string;
  category?: {
    id: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private useBackend = true; // ✅ true = backend, false = mock

  // Datos mock (respaldo)
  private allProducts: Product[] = [
    { id: 1, name: 'Ferrari Black Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product1.jpg', type: 'chaqueta' },
    { id: 2, name: 'Jack Daniels Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product2.jpg', type: 'chaqueta' },
    { id: 3, name: 'Ford Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product3.jpg', type: 'chaqueta' },
    { id: 4, name: 'Red Bull Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product4.jpg', type: 'chaqueta' },
    { id: 5, name: 'Ferrari Cuero Racing Jacket', price: 80000, originalPrice: 100000, image: 'assets/product5.jpg', type: 'chaqueta' },
    { id: 6, name: 'Porsche Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product6.jpg', type: 'chaqueta' },
    { id: 7, name: 'Ferrari White Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product7.jpg', type: 'chaqueta' },
    { id: 8, name: 'Subaru Racing Jacket', price: 60000, originalPrice: 80000, image: 'assets/product8.jpg', type: 'chaqueta' },

    { id: 9, name: 'Gorra F1 Racing Black', price: 25000, originalPrice: 30000, image: 'assets/acc1.jpg', type: 'accesorio' },
    { id: 10, name: 'Guantes F1 Racing', price: 35000, originalPrice: 45000, image: 'assets/acc2.jpg', type: 'accesorio' },
    { id: 11, name: 'Llavero Pistón Metálico', price: 15000, originalPrice: 20000, image: 'assets/acc3.jpg', type: 'accesorio' },
    { id: 12, name: 'Mochila Red Bull Team', price: 55000, originalPrice: 70000, image: 'assets/acc4.jpg', type: 'accesorio' },
    { id: 13, name: 'Calcetines Checkered Flag', price: 12000, originalPrice: 15000, image: 'assets/acc5.jpg', type: 'accesorio' },
    { id: 14, name: 'Cinturón de Seguridad F1', price: 28000, originalPrice: 35000, image: 'assets/acc6.jpg', type: 'accesorio' },
    { id: 15, name: 'Tazón F1', price: 18000, originalPrice: 22000, image: 'assets/acc7.jpg', type: 'accesorio' },
    { id: 16, name: 'Gafas de Sol Aviador', price: 40000, originalPrice: 50000, image: 'assets/acc8.jpg', type: 'accesorio' },
  ];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ============================================
  // MÉTODOS MOCK (compatibilidad)
  // ============================================

  getAllProducts(): Product[] {
    return this.allProducts;
  }

  getAccessories(): Product[] {
    return this.allProducts.filter(p => p.type === 'accesorio');
  }

  getJackets(): Product[] {
    return this.allProducts.filter(p => p.type === 'chaqueta');
  }

  getProductById(id: number): Product | undefined {
    return this.allProducts.find(p => p.id === id);
  }

  // ============================================
  // MÉTODOS BACKEND/MOCK (Observable)
  // ============================================

  getJacketProducts(): Observable<Product[]> {
  if (!this.useBackend) {
    return of(this.allProducts.filter(p => p.type === 'chaqueta'));
  }

  return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
    map(response => response.products.filter((p: Product) => p.category?.id === 1)),
    tap(products => console.log('Chaquetas filtradas:', products)),
    catchError(error => {
      console.error('❌ Error, usando MOCK:', error);
      return of(this.allProducts.filter(p => p.type === 'chaqueta'));
    })
  );
}


  getAccessoryProducts(): Observable<Product[]> {
    if (!this.useBackend) {
      console.log('📦 Usando datos MOCK para accesorios');
      return of(this.allProducts.filter(p => p.type === 'accesorio'));
    }

    console.log('🌐 Cargando accesorios desde BACKEND');
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      map(response => response.products.filter((p: Product) => p.categoryId === 2)),
      catchError(error => {
        console.error('❌ Error al cargar desde backend, usando MOCK:', error);
        return of(this.allProducts.filter(p => p.type === 'accesorio'));
      })
    );
  }

  getAllProductsFromAPI(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      map(response => response.products),
      catchError(error => {
        console.error('❌ Error al cargar productos desde API:', error);
        return of(this.allProducts);
      })
    );
  }

  getProductByIdFromAPI(id: number): Observable<Product> {
    if (!this.useBackend) {
      const product = this.allProducts.find(p => p.id === id);
      return of(product as Product);
    }

    console.log(`🌐 GET ${this.apiUrl}/${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => response.product),
      catchError(error => {
        console.error('❌ Error al cargar producto desde API:', error);
        const mockProduct = this.allProducts.find(p => p.id === id);
        return of(mockProduct as Product);
      })
    );
  }

  createProduct(product: Product): Observable<any> {
    return this.http.post(this.apiUrl, product, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: Partial<Product>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  setUseBackend(value: boolean): void {
    this.useBackend = value;
    console.log(`🔄 Modo cambiado a: ${value ? 'BACKEND' : 'MOCK'}`);
  }

  isUsingBackend(): boolean {
    return this.useBackend;
  }
}
