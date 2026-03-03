import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product, CreateProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:9095/api/produits';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(product: CreateProductRequest): Observable<Product> {
    console.log('Creating product:', product);
    return this.http.post<Product>(this.baseUrl, product, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, product: Product): Observable<Product> {
    console.log('Updating product:', product); // Debug
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    return throwError(() => error);
  }
}