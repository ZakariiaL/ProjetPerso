import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() menuClicked = new EventEmitter<void>();

  cartCount = 0;
  searchVisible = false;
  isDesktop = true;

  // 👇 Pour scroll hide/show
  lastScrollTop = 0;
  isHidden = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    if (isBrowser()) {
      this.isDesktop = window.innerWidth >= 768;

      window.addEventListener('resize', () => {
        this.isDesktop = window.innerWidth >= 768;
      });

      this.cartService.cart$.subscribe(cart => {
        this.cartCount = cart.length;
      });
    }
  }

  @HostListener('window:scroll', [])
  @HostListener('window:scroll', [])
  handleScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
    if (Math.abs(currentScroll - this.lastScrollTop) < 5) return;
  
    if (currentScroll > this.lastScrollTop && currentScroll > 100) {
      this.isHidden = true; // 👉 vers le bas : cacher
    } else {
      this.isHidden = false; // 👉 vers le haut : afficher
    }
  
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
  
  

  toggleSidebar() {
    this.menuClicked.emit();
  }

  toggleSearch() {
    this.searchVisible = !this.searchVisible;
  }
}
