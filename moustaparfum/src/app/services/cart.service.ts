import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();

  // Sidebar (panier à droite)
  private sidebar = new BehaviorSubject<boolean>(false);
  sidebar$ = this.sidebar.asObservable();
  sidebarOpen = false;

  /**
   * Ajouter un produit au panier
   */
  addToCart(product: Product): void {
    this.cart.push(product);
    this.cartSubject.next([...this.cart]); // déclenche l'observable
  }

  /**
   * Retourner tous les produits du panier
   */
  getCart(): Product[] {
    return this.cart;
  }

  /**
   * Compter les articles
   */
  getCartCount(): number {
    return this.cart.length;
  }

  /**
   * Vider le panier
   */
  clearCart(): void {
    this.cart = [];
    this.cartSubject.next([]);
  }

  /**
   * Ouvrir le panneau panier
   */
  openSidebar(): void {
    this.sidebarOpen = true;
    this.sidebar.next(true);
  }

  /**
   * Fermer le panneau panier
   */
  closeSidebar(): void {
    this.sidebarOpen = false;
    this.sidebar.next(false);
  }

  /**
   * Liste fictive de tous les parfums disponibles
   */
  getAllProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Parfum Homme 1',
        imageUrl: 'assets/parfums/H1.png',
        price: 71,
        category: 'homme',
        description: 'Parfum masculin intense et élégant.',
        brand: 'MoustaParfum',
        inStock: true,
        
      },
      {
        id: 2,
        name: 'Parfum Femme 1',
        imageUrl: 'assets/parfums/F1.png',
        price: 72,
        category: 'femme',
        description: 'Parfum féminin floral et léger.',
        brand: 'MoustaParfum',
        inStock: true,
        
      },
      // 🔁 Tu peux en ajouter autant que tu veux ici
    ];
  }
}
