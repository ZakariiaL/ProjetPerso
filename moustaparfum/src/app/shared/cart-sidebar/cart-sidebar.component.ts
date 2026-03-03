import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ c'est lui qui fournit les pipes
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule], // ✅ ça inclut NgIf, NgFor, CurrencyPipe, etc.
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  constructor(public cartService: CartService) {}

  get cart() {
    return this.cartService.getCart();
  }

  closeSidebar() {
    this.cartService.closeSidebar();
  }

  total() {
    return this.cart.reduce((sum, p) => sum + p.price, 0);
  }
}
