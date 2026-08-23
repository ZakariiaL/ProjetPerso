import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SidebarComponent {
  @Output() closed = new EventEmitter<void>();

  isClosed = true;

  @Input() set isOpen(value: boolean) {
    this.isClosed = !value;
  }

  menus = [
    { label: 'Accueil', icon: 'home', route: '/' },
    { label: 'Parfums hommes', icon: 'male', route: '/category/homme' },
    { label: 'Parfums femmes', icon: 'female', route: '/category/femme' },
    { label: 'Niche', icon: 'diamond', route: '/category/niche' },
    { label: 'Ambiances', icon: 'spa', route: '/category/ambiances' },
    { label: 'Nouveautés', icon: 'auto_awesome', route: '/collection' },
    { label: 'Panier', icon: 'shopping_cart', route: '/cart' },
    { label: 'Contact', icon: 'support_agent', route: '/contact' },
  ];

  constructor(private router: Router, private sidebarService: SidebarService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeSidebar();
      }
    });
  }

  closeSidebar(): void {
    this.isClosed = true;
    this.sidebarService.toggleSidebar(this.isClosed);
    this.closed.emit();
  }

  navigate(route: string): void {
    this.router.navigate([route]).then(() => {
      if (route.startsWith('/category')) {
        this.scrollToCatalog();
      }
    });
    this.closeSidebar();
  }

  isActive(route: string): boolean {
    if (route === '/') {
      return this.router.url === '/';
    }

    return this.router.url.startsWith(route);
  }

  private scrollToCatalog(): void {
    if (typeof document === 'undefined') {
      return;
    }

    setTimeout(() => {
      const catalog = document.querySelector('.catalog-header');

      if (!catalog) {
        return;
      }

      const offset = 132;
      const top = catalog.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 90);
  }
}
