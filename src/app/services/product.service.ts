import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Product, CreateProductRequest } from '../models/product.model';
import { AuthService } from './auth.service';
import { FALLBACK_PRODUCTS } from '../data/fallback-products';
import { isBrowser } from '../utils/platform';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:9095/api/produits';
  private cachedProducts: Product[] = [];
  private readonly localPerfumeImages = new Set([
    'F1.png',
    'F2.png',
    'F3.png',
    'F4.png',
    'F5.png',
    'F6.png',
    'H1.png',
    'H2.png',
    'H3.png',
    'H4.png',
    'H5.png',
    'H6.png',
    'N1.png',
    'N2.png',
    'N3.png',
    'N4.png',
    'N5.png',
    'N6.png',
    'p1.png',
    'p2.png'
  ]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(): Observable<Product[]> {
    if (this.shouldUseStaticCatalog()) {
      return of(this.cacheProducts(FALLBACK_PRODUCTS));
    }

    return this.http.get<Product[]>(this.baseUrl).pipe(
      map((products) => this.cacheProducts(products?.length ? products : FALLBACK_PRODUCTS)),
      catchError((error) => {
        console.warn('Backend produits indisponible, utilisation du catalogue local.', error);
        return of(this.cacheProducts(FALLBACK_PRODUCTS));
      })
    );
  }

  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      map((products) => this.cacheProducts(products || [])),
      catchError((error) => {
        console.error('Catalogue admin indisponible:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<Product> {
    const cachedProduct = this.findInCache(id);

    if (cachedProduct) {
      return of(cachedProduct);
    }

    if (this.shouldUseStaticCatalog()) {
      return of(this.findFallbackProduct(id));
    }

    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      map((product) => this.normalizeProduct(product)),
      catchError((error) => {
        console.warn('Détail produit indisponible, recherche dans le catalogue.', error);
        return this.getAll().pipe(
          map((products) => {
            const product = products.find((item) => Number(item.id) === Number(id));

            if (product) {
              return product;
            }

            return this.findFallbackProduct(id);
          })
        );
      })
    );
  }

  create(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, this.normalizePayload(product), this.authHttpOptions()).pipe(
      map((createdProduct) => {
        const normalized = this.normalizeProduct(createdProduct);
        this.cachedProducts = [normalized, ...this.cachedProducts.filter((item) => item.id !== normalized.id)];
        return normalized;
      }),
      catchError(this.handleError)
    );
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, this.normalizePayload(product), this.authHttpOptions()).pipe(
      map((updatedProduct) => {
        const normalized = this.normalizeProduct(updatedProduct);
        this.cachedProducts = this.cachedProducts.map((item) => item.id === normalized.id ? normalized : item);
        return normalized;
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.authHttpOptions()).pipe(
      map((result) => {
        this.cachedProducts = this.cachedProducts.filter((item) => Number(item.id) !== Number(id));
        return result;
      }),
      catchError(this.handleError)
    );
  }

  private authHttpOptions() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authorization = this.authService.getAuthorizationHeader();

    if (authorization) {
      headers = headers.set('Authorization', authorization);
    }

    return { headers };
  }

  private cacheProducts(products: Product[]): Product[] {
    this.cachedProducts = products.map((product) => this.normalizeProduct(product));
    return this.cachedProducts;
  }

  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      id: Number(product.id),
      category: this.normalizeCategory(product.category, product),
      imageUrl: this.normalizeImageUrl(product.imageUrl, product),
      price: Number(product.price || 0),
      inStock: Boolean(product.inStock),
      concentration: this.normalizeText(product.concentration) || 'Extrait de parfum',
      volume: this.normalizeVolume(product.volume)
    };
  }

  private normalizePayload(product: Product | CreateProductRequest): Product | CreateProductRequest {
    return {
      ...product,
      category: this.normalizeCategory(product.category, product),
      imageUrl: this.normalizeImageUrl(product.imageUrl, product),
      price: Number(String(product.price || 0).replace(',', '.')),
      inStock: Boolean(product.inStock),
      concentration: this.normalizeText(product.concentration) || 'Extrait de parfum',
      volume: this.normalizeVolume(product.volume)
    };
  }

  private normalizeText(value: string | undefined): string {
    return String(value || '').trim();
  }

  private normalizeVolume(volume: string | undefined): string {
    const cleaned = String(volume || '')
      .trim()
      .replace(/\s+/g, '')
      .toLowerCase();

    if (!cleaned) {
      return '30ml';
    }

    const match = cleaned.match(/^(\d+(?:[,.]\d+)?)(ml|l)$/);

    if (!match) {
      return volume?.trim() || '30ml';
    }

    const amount = match[1].replace(',', '.');
    const unit = match[2] === 'l' ? 'L' : 'ml';
    return `${amount}${unit}`;
  }

  private normalizeImageUrl(imageUrl: string | undefined, product?: Partial<Product | CreateProductRequest>): string {
    const cleanedUrl = String(imageUrl || '').trim();
    const imageFile = this.extractImageFile(cleanedUrl);

    if (imageFile) {
      return `assets/parfums/${imageFile}`;
    }

    const inferredFile = this.inferImageFile(product);

    if (inferredFile) {
      return `assets/parfums/${inferredFile}`;
    }

    return cleanedUrl;
  }

  private extractImageFile(imageUrl: string): string | null {
    const fileName = imageUrl
      .split(/[?#]/)[0]
      .split(/[\\/]/)
      .pop();

    if (!fileName) {
      return null;
    }

    const match = [...this.localPerfumeImages].find((image) => image.toLowerCase() === fileName.toLowerCase());
    return match || null;
  }

  private inferImageFile(product?: Partial<Product | CreateProductRequest>): string | null {
    const source = `${product?.name || ''} ${product?.category || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const numberMatch = source.match(/\b0?([1-6])\b/);

    if (!numberMatch) {
      return null;
    }

    const index = numberMatch[1];

    if (/\b(homme|hommes|masculin)\b/.test(source)) {
      return `H${index}.png`;
    }

    if (/\b(femme|femmes|feminin)\b/.test(source)) {
      return `F${index}.png`;
    }

    if (/\b(niche|nice|unisexe|unisex|mixte)\b/.test(source)) {
      return `N${index}.png`;
    }

    if (/\b(ambiance|ambiances|maison|interieur)\b/.test(source) && Number(index) <= 2) {
      return `p${index}.png`;
    }

    return null;
  }

  private normalizeCategory(category: string | undefined, product?: Partial<Product | CreateProductRequest>): string {
    const cleanCategory = String(category || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const aliases: Record<string, string> = {
      homme: 'homme',
      hommes: 'homme',
      man: 'homme',
      men: 'homme',
      masculin: 'homme',
      femme: 'femme',
      femmes: 'femme',
      woman: 'femme',
      women: 'femme',
      feminin: 'femme',
      niche: 'niche',
      nice: 'niche',
      unisex: 'niche',
      unisexe: 'niche',
      mixte: 'niche',
      ambiance: 'ambiances',
      ambiances: 'ambiances',
      ambience: 'ambiances',
      ambiences: 'ambiances',
      maison: 'ambiances',
      interieur: 'ambiances'
    };

    if (aliases[cleanCategory]) {
      return aliases[cleanCategory];
    }

    const source = `${product?.name || ''} ${product?.imageUrl || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (/\b(homme|h[1-9]\d*)\b/.test(source) || /\/h\d+\./.test(source)) {
      return 'homme';
    }

    if (/\b(femme|f[1-9]\d*)\b/.test(source) || /\/f\d+\./.test(source)) {
      return 'femme';
    }

    if (/\b(ambiance|ambiances|maison|interieur)\b/.test(source) || /\/p\d+\./.test(source)) {
      return 'ambiances';
    }

    return 'niche';
  }

  private findInCache(id: number): Product | null {
    return this.cachedProducts.find((item) => Number(item.id) === Number(id)) || null;
  }

  private shouldUseStaticCatalog(): boolean {
    return isBrowser() && window.location.hostname.includes('github.io');
  }

  private findFallbackProduct(id: number): Product {
    return this.normalizeProduct(FALLBACK_PRODUCTS.find((item) => Number(item.id) === Number(id)) || FALLBACK_PRODUCTS[0]);
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    return throwError(() => error);
  }
}
