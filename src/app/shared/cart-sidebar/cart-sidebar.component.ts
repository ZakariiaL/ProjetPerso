import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  private readonly fallbackImage = 'assets/parfums/p1.png';

  constructor(public cartService: CartService) {}

  get cart() {
    return this.cartService.getCartItems();
  }

  closeSidebar(): void {
    this.cartService.closeSidebar();
  }

  total(): number {
    return this.cartService.getTotal();
  }

  getProductFormat(product: Product): string {
    const concentration = product.concentration?.trim() || 'Extrait de parfum';
    const volume = product.volume?.trim() || '30ml';
    return `${concentration} / ${volume}`;
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
}
