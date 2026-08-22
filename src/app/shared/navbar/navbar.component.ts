import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService, AdminSession } from '../../services/auth.service';
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
  adminSession: AdminSession | null = null;

  lastScrollTop = 0;
  isHidden = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

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

    this.authService.session$.subscribe(session => {
      this.adminSession = session;
    });
  }

  @HostListener('window:scroll', [])
  handleScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(currentScroll - this.lastScrollTop) < 5) return;

    this.isHidden = currentScroll > this.lastScrollTop && currentScroll > 100;
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  toggleSidebar(): void {
    this.menuClicked.emit();
  }

  toggleSearch(): void {
    this.searchVisible = !this.searchVisible;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
