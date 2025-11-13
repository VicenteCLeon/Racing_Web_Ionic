import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface CartItem {
  id?: number;
  cartId: number;
  productId: number;
  quantity: number;
  size: string;
  product?: any;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:3000/api/carts';
  private itemsApiUrl = 'http://localhost:3000/api/cart-items';
  private currentCartId: number | null = null;

  private cartChanged = new BehaviorSubject<void>(undefined);
  cartChanged$ = this.cartChanged.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  setCurrentCartId(id: number) {
    this.currentCartId = id;
  }

  getCurrentCartId(): number | null {
    return this.currentCartId;
  }

  notifyCartChanged() {
    this.cartChanged.next();
  }

  createCart(): Observable<any> {
    return this.http.post(this.apiUrl, {}, { headers: this.getHeaders() });
  }

  getUserCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
  }

  addCartItem(item: CartItem): Observable<any> {
    return this.http.post(this.itemsApiUrl, item, { headers: this.getHeaders() });
  }

  updateCartItem(id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.itemsApiUrl}/${id}`, { quantity }, { headers: this.getHeaders() });
  }

  removeCartItem(id: number): Observable<any> {
    return this.http.delete(`${this.itemsApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  clearCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartId}`, { headers: this.getHeaders() });
  }
}
