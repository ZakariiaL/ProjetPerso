import { Component, OnInit } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  whatsappPhone = '212600000000';
  private readonly fallbackImage = 'assets/parfums/p1.png';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    if (isBrowser()) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    this.refreshItems();

    this.cartService.cart$.subscribe(() => {
      this.refreshItems();
    });
  }

  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get deliveryLabel(): string {
    return 'À confirmer';
  }

  get whatsappUrl(): string {
    const lines = this.items.map((item) => {
      const total = item.product.price * item.quantity;
      return `- ${item.product.name} (${this.getProductFormat(item.product)}) x${item.quantity} = ${total} MAD`;
    });

    const message = [
      'Bonjour, je souhaite commander :',
      ...lines,
      '',
      `Total produits : ${this.subtotal} MAD`,
      'Livraison : à confirmer',
      '',
      'Merci de me confirmer la disponibilité et la livraison.'
    ].join('\n');

    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }

  increase(item: CartItem): void {
    this.cartService.increaseQuantity(item.product.id);
  }

  decrease(item: CartItem): void {
    this.cartService.decreaseQuantity(item.product.id);
  }

  remove(item: CartItem): void {
    this.cartService.removeProduct(item.product.id);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return this.getAssetImage(this.fallbackImage);
    }

    if (product.imageUrl.startsWith('assets/')) {
      return this.getAssetImage(product.imageUrl);
    }

    if (product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }

    return `http://localhost:9095${product.imageUrl}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    const fallback = this.getAssetImage(this.fallbackImage);

    if (image.src !== fallback) {
      image.src = fallback;
    }
  }

  private getAssetImage(path: string): string {
    const baseHref = isBrowser()
      ? document.querySelector('base')?.getAttribute('href') || '/'
      : '/ProjetPerso/';
    const normalizedBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBase}${normalizedPath}`;
  }

  getProductFormat(product: Product): string {
    const concentration = product.concentration?.trim() || 'Extrait de parfum';
    const volume = product.volume?.trim() || '30ml';
    return `${concentration} / ${volume}`;
  }

  trackByProductId(_index: number, item: CartItem): number {
    return item.product.id;
  }

  private refreshItems(): void {
    this.items = this.cartService.getCartItems();
  }
}
