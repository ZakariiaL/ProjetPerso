 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Product, CreateProductRequest } from '../models/product.model';
import { AuthService } from './auth.service';
import { FALLBACK_PRODUCTS } from '../data/fallback-products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:9095/api/produits';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      catchError((error) => {
        console.warn('Backend produits indisponible, utilisation du catalogue local.', error);
        return of(FALLBACK_PRODUCTS);
      })
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        console.warn('Backend produit indisponible, utilisation du catalogue local.', error);
        const product = FALLBACK_PRODUCTS.find((item) => item.id === id) || FALLBACK_PRODUCTS[0];
        return of(product);
      })
    );
  }

  create(product: CreateProductRequest): Observable<Product> {
    console.log('Creating product:', product);
    return this.http.post<Product>(this.baseUrl, product, this.authHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, product: Product): Observable<Product> {
    console.log('Updating product:', product); // Debug
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product, this.authHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.authHttpOptions()).pipe(
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

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    return throwError(() => error);
  }
}
