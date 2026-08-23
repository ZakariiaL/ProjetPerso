import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();

  private addedToCartSubject = new Subject<Product>();
  addedToCart$ = this.addedToCartSubject.asObservable();

  private sidebar = new BehaviorSubject<boolean>(false);
  sidebar$ = this.sidebar.asObservable();
  sidebarOpen = false;

  addToCart(product: Product): void {
    this.cart.push(product);
    this.emitCart();
    this.addedToCartSubject.next(product);
  }

  getCart(): Product[] {
    return this.cart;
  }

  getCartItems(): CartItem[] {
    return this.groupCart(this.cart);
  }

  getCartCount(): number {
    return this.cart.length;
  }

  getTotal(): number {
    return this.cart.reduce((sum, product) => sum + product.price, 0);
  }

  increaseQuantity(productId: number): void {
    const product = this.cart.find((item) => item.id === productId);

    if (product) {
      this.cart.push(product);
      this.emitCart();
    }
  }

  decreaseQuantity(productId: number): void {
    const index = this.cart.findIndex((item) => item.id === productId);

    if (index >= 0) {
      this.cart.splice(index, 1);
      this.emitCart();
    }
  }

  removeProduct(productId: number): void {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.emitCart();
  }

  clearCart(): void {
    this.cart = [];
    this.emitCart();
  }

  openSidebar(): void {
    this.sidebarOpen = true;
    this.sidebar.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    this.sidebar.next(false);
  }

  private emitCart(): void {
    this.cartSubject.next([...this.cart]);
  }

  private groupCart(products: Product[]): CartItem[] {
    const items = new Map<number, CartItem>();

    products.forEach((product) => {
      const existing = items.get(product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        items.set(product.id, { product, quantity: 1 });
      }
    });

    return Array.from(items.values());
  }
}
