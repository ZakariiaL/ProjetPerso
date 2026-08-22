import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  currentPage = 0;
  itemsPerPageMobile = 4;
  isMobile = false;
  activeCategory: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (isBrowser()) {
      this.isMobile = window.innerWidth < 768;

      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth < 768;
      });
    }

    this.productService.getAll().subscribe((all: Product[]) => {
      this.route.paramMap.subscribe(params => {
        const type = params.get('type');
        this.activeCategory = type;
        this.products = type
          ? all.filter((p: Product) => p.category?.toLowerCase() === type.toLowerCase())
          : all;
        this.currentPage = 0;
      });
    });
  }

  get featuredProduct(): Product | null {
    return this.products[0] || null;
  }

  get pagedProducts(): Product[] {
    const start = this.currentPage * this.itemsPerPageMobile;
    return this.products.slice(start, start + this.itemsPerPageMobile);
  }

  get pageCount(): number {
    return Math.ceil(this.products.length / this.itemsPerPageMobile);
  }

  changePage(index: number): void {
    this.currentPage = index;
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.cartService.openSidebar();
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return 'assets/parfums/p1.png';
    }

    if (product.imageUrl.startsWith('assets/') || product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }

    return `http://localhost:9095${product.imageUrl}`;
  }

  getProductMeta(product: Product): string {
    const category = product.category ? `Parfums ${this.formatCategory(product.category)}` : 'Parfums';
    const concentration = product.concentration || 'Extrait de parfum';
    return `${category} / ${concentration}`;
  }

  getProductNotes(product: Product): string {
    const notes = [product.topNotes, product.heartNotes, product.baseNotes].filter(Boolean);
    return notes.length ? notes.join(' - ') : 'Signature olfactive intense et longue tenue';
  }

  private formatCategory(category: string): string {
    const cleanCategory = category.toLowerCase();
    return cleanCategory.charAt(0).toUpperCase() + cleanCategory.slice(1);
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }
}
