import { Component, Input } from '@angular/core';
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
  @Input() isOpen: boolean = false;

  isClosed = true;

  menus = [
    { label: 'Accueil', icon: 'fas fa-home', route: '/' },
    { label: 'Catalogue', icon: 'fas fa-fire', route: '/' },
    { label: 'Parfum Homme', icon: 'fas fa-mars', route: '/category/homme' },
    { label: 'Parfum Femme', icon: 'fas fa-venus', route: '/category/femme' },
    { label: 'Unisex', icon: 'fas fa-genderless', route: '/category/unisex' },
    { label: 'Nouveautes', icon: 'fas fa-star', route: '/collection' },
    { label: 'Promotions', icon: 'fas fa-tags', route: '/collection' },
    { label: 'Contact', icon: 'fas fa-phone', route: '/suivi' },
  ];

  constructor(private router: Router, private sidebarservice: SidebarService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeSidebar();
      }
    });
  }

  onClick(event: Event): void {
    this.isClosed = !this.isClosed;
    this.sidebarservice.toggleSidebar(this.isClosed);
    event.stopPropagation();
  }

  closeSidebar(): void {
    this.isClosed = true;
    this.sidebarservice.toggleSidebar(this.isClosed);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.closeSidebar();
  }
}
