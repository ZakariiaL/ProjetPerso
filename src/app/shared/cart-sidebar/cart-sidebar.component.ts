import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
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
}
