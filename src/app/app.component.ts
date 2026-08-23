import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { CartSidebarComponent } from './shared/cart-sidebar/cart-sidebar.component';
import { CartService } from './services/cart.service';
import { Product } from './models/product.model';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    CartSidebarComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarOpen = false;
  cartToastProduct: Product | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private cartService: CartService) {
    this.cartService.addedToCart$.subscribe((product) => {
      this.cartToastProduct = product;

      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }

      this.toastTimer = setTimeout(() => {
        this.cartToastProduct = null;
      }, 1800);
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
