import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private allProducts: Product[] = [];
  private categoryProducts: Product[] = [];
  products: Product[] = [];
  currentPage = 0;
  itemsPerPageMobile = 4;
  isMobile = false;
  activeCategory: string | null = null;
  searchTerm = '';
  stockFilter: 'all' | 'available' | 'out' = 'all';
  sortKey: 'featured' | 'nameAsc' | 'priceAsc' | 'priceDesc' = 'featured';
  activeBannerIndex = 0;
  banners = [
    {
      image: 'assets/parfums/Gemini_Generated_Image_5eia0o5eia0o5eia.jpg',
      alt: 'Collection Musta Parfums - parfums d\'exception et élégance'
    },
    {
      image: 'assets/parfums/Gemini_Generated_Image_dpv2akdpv2akdpv2.jpg',
      alt: 'Collection Musta Parfums - l\'art d\'être soi'
    }
  ];

  private bannerTimerId: ReturnType<typeof setInterval> | null = null;
  private readonly fallbackImage = 'assets/parfums/p1.png';
  private readonly assetVersion = '20260823-1';
  private resizeListener = () => {
    this.isMobile = window.innerWidth < 768;
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  readonly stockOptions = [
    { value: 'all', label: 'Tous les stocks' },
    { value: 'available', label: 'En stock' },
    { value: 'out', label: 'Rupture' }
  ] as const;

  readonly sortOptions = [
    { value: 'featured', label: 'Sélection Musta' },
    { value: 'nameAsc', label: 'Nom A-Z' },
    { value: 'priceAsc', label: 'Prix croissant' },
    { value: 'priceDesc', label: 'Prix décroissant' }
  ] as const;

  ngOnInit(): void {
    if (isBrowser()) {
      this.isMobile = window.innerWidth < 768;
      window.addEventListener('resize', this.resizeListener);
      this.startBannerAutoplay();
    }

    this.productService.getAll().subscribe((all: Product[]) => {
      this.allProducts = all;
      this.route.paramMap.subscribe(params => {
        const type = params.get('type');
        this.activeCategory = type;
        this.categoryProducts = type
          ? all.filter((p: Product) => p.category?.toLowerCase() === type.toLowerCase())
          : all;
        this.applyCatalogFilters(false);
        this.currentPage = 0;

        if (type && isBrowser()) {
          setTimeout(() => this.scrollToCatalog(), 80);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (isBrowser()) {
      window.removeEventListener('resize', this.resizeListener);
    }

    this.pauseBannerAutoplay();
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

  applyCatalogFilters(shouldScroll = true): void {
    const search = this.normalizeSearch(this.searchTerm);
    let nextProducts = [...this.categoryProducts];

    if (search) {
      nextProducts = nextProducts.filter((product) => {
        const haystack = this.normalizeSearch([
          product.name,
          product.brand,
          product.category,
          product.concentration,
          product.volume,
          product.description
        ].filter(Boolean).join(' '));
        return haystack.includes(search);
      });
    }

    if (this.stockFilter === 'available') {
      nextProducts = nextProducts.filter((product) => product.inStock);
    }

    if (this.stockFilter === 'out') {
      nextProducts = nextProducts.filter((product) => !product.inStock);
    }

    nextProducts.sort((a, b) => this.sortProducts(a, b));
    this.products = nextProducts;
    this.currentPage = 0;

    if (shouldScroll && isBrowser()) {
      setTimeout(() => this.scrollToCatalog(), 40);
    }
  }

  resetCatalogFilters(): void {
    this.searchTerm = '';
    this.stockFilter = 'all';
    this.sortKey = 'featured';
    this.applyCatalogFilters();
  }

  nextBanner(): void {
    this.activeBannerIndex = (this.activeBannerIndex + 1) % this.banners.length;
    this.restartBannerAutoplay();
  }

  previousBanner(): void {
    this.activeBannerIndex = (this.activeBannerIndex - 1 + this.banners.length) % this.banners.length;
    this.restartBannerAutoplay();
  }

  goToBanner(index: number): void {
    this.activeBannerIndex = index;
    this.restartBannerAutoplay();
  }

  startBannerAutoplay(): void {
    if (!isBrowser() || this.bannerTimerId) {
      return;
    }

    this.bannerTimerId = setInterval(() => {
      this.activeBannerIndex = (this.activeBannerIndex + 1) % this.banners.length;
    }, 3000);
  }

  pauseBannerAutoplay(): void {
    if (!this.bannerTimerId) {
      return;
    }

    clearInterval(this.bannerTimerId);
    this.bannerTimerId = null;
  }

  private restartBannerAutoplay(): void {
    this.pauseBannerAutoplay();
    this.startBannerAutoplay();
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.cartService.openSidebar();
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

  getAssetImage(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    const baseHref = isBrowser()
      ? document.querySelector('base')?.getAttribute('href') || '/'
      : '/';
    const normalizedBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    const normalizedPath = path.replace(/^\/+/, '');
    const separator = normalizedPath.includes('?') ? '&' : '?';
    return `${normalizedBase}${normalizedPath}${separator}v=${this.assetVersion}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    const fallback = this.getAssetImage(this.fallbackImage);

    if (image.src !== fallback) {
      image.src = fallback;
    }
  }

  getProductMeta(product: Product): string {
    const category = product.category ? `Parfums ${this.formatCategory(product.category)}` : 'Parfums';
    const concentration = product.concentration || 'Extrait de parfum';
    return `${category} / ${concentration}`;
  }

  getProductSummary(product: Product): string {
    if (product.description?.trim()) {
      return product.description.trim();
    }

    const concentration = product.concentration || 'Extrait de parfum';
    const volume = this.getProductVolume(product);
    return `${concentration} ${volume}, signature intense et longue tenue`;
  }

  getProductVolume(product: Product): string {
    return product.volume?.trim() || '30ml';
  }

  private formatCategory(category: string): string {
    const cleanCategory = category.toLowerCase();
    return cleanCategory.charAt(0).toUpperCase() + cleanCategory.slice(1);
  }

  private sortProducts(a: Product, b: Product): number {
    if (this.sortKey === 'nameAsc') {
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    }

    if (this.sortKey === 'priceAsc') {
      return Number(a.price || 0) - Number(b.price || 0);
    }

    if (this.sortKey === 'priceDesc') {
      return Number(b.price || 0) - Number(a.price || 0);
    }

    const aIndex = this.allProducts.findIndex((product) => Number(product.id) === Number(a.id));
    const bIndex = this.allProducts.findIndex((product) => Number(product.id) === Number(b.id));
    return aIndex - bIndex;
  }

  private normalizeSearch(value: string): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private scrollToCatalog(): void {
    const catalog = document.querySelector('.catalog-header');

    if (!catalog) {
      return;
    }

    const offset = 132;
    const top = catalog.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }
}
