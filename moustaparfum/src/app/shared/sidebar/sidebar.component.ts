import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Route, Router } from '@angular/router';
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
  isAcceuil: boolean = false;

  menus = [
    {
      label: 'Accueil',
      icon: 'fas fa-home',
      action: (data: any) => this.onAccueil(data),
    },
    {
      label: 'Parfums',
      icon: 'fas fa-fire',
      action: (data: any) => this.onListe(data),
    },
    {
      label: 'Parfum Homme',
      icon: 'fas fa-mars',
      action: (data: any) => this.onRecherche(data),
    },

    {
      label: 'Parfum Femme',
      icon: 'fas fa-venus',
      action: (data: any) => this.onConvertisseur(data),
    },
    {
      label: 'Unisex',
      icon: 'fas fa-genderless',
      action: (data: any) => this.onParametre(data),
    },
    {
      label: 'Nouveautés',
      icon: 'fas fa-star',
      action: (data: any) => this.onAdministartion(data),
    },
    {
      label: 'Promotions',
      icon: 'fas fa-tags',
      action: (data: any) => this.onSuivi(data),
    },
    {
      label: 'Suivi de commande',
      icon: 'fas fa-truck',
      action: (data: any) => this.onRejet(data),
    },
  ];

  constructor(private router: Router, private sidebarservice: SidebarService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeSidebar();
        this.checkIfAccueil(event.urlAfterRedirects);
      }
    });
  }

  onAccueil(data: any) {
    this.router.navigate(['home/accueil']);
    this.toggleSidebar(data);
  }

  onRecherche(data: any) {
    this.router.navigate(['home/recherche']);
    this.toggleSidebar(data);
  }

  onListe(data: any) {
    this.router.navigate(['home/liste']);
    this.toggleSidebar(data);
  }

  onConvertisseur(data: any) {
    this.router.navigate(['home/convertisseur']);
    this.toggleSidebar(data);
  }

  onParametre(data: any) {
    this.router.navigate(['home/parametre']);
    this.toggleSidebar(data);
  }

  onAdministartion(data: any) {
    this.router.navigate(['home/administration']);
    this.toggleSidebar(data);
  }

  onSuivi(data: any) {
    this.router.navigate(['home/suivi']);
    this.toggleSidebar(data);
  }

  onRejet(data: any) {
    this.router.navigate(['home/rejet']);
    this.toggleSidebar(data);
  }

  backMenu() {
    this.router.navigate(['home/accueil']);
  }

  toggleSidebar(data: any) {}

  onClick(data: any) {
    this.isClosed = !this.isClosed;
    console.log('Sidebar toggled:', this.isClosed);
    this.sidebarservice.toggleSidebar(this.isClosed);
    data.classList.toggle('change');
  }


  closeSidebar() {
    this.isClosed = true;
    this.sidebarservice.toggleSidebar(this.isClosed);
  }

  navigate(route: string) {
    this.router.navigate([route]);
    this.closeSidebar();
  }

  checkIfAccueil(currentRoute: string) {
    this.isAcceuil = currentRoute === '/home/accueil';
    console.log('Is Accueil:', this.isAcceuil);
  }
}