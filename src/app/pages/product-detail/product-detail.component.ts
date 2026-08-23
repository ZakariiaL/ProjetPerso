import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';
import { isBrowser } from '../../utils/platform';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, CurrencyPipe, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  quantity = 1;
  showOrderForm = false;
  clientName = '';
  clientPhone = '';
  private readonly fallbackImage = 'assets/parfums/p1.png';

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (isBrowser()) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }

      this.productService.getById(id).subscribe(prod => {
        this.product = prod;
        this.quantity = 1;
      });
    });
  }

  addToCart(): void {
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product);
    }
    this.cartService.openSidebar();
  }

  increase(): void {
    this.quantity++;
  }

  decrease(): void {
    if (this.quantity > 1) this.quantity--;
  }

  buyNow(): void {
    this.showOrderForm = true;
  }

  getProductImage(): string {
    if (!this.product?.imageUrl) {
      return this.getAssetImage(this.fallbackImage);
    }

    if (this.product.imageUrl.startsWith('assets/')) {
      return this.getAssetImage(this.product.imageUrl);
    }

    if (this.product.imageUrl.startsWith('http')) {
      return this.product.imageUrl;
    }

    return `http://localhost:9095${this.product.imageUrl}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    const fallback = this.getAssetImage(this.fallbackImage);

    if (image.src !== fallback) {
      image.src = fallback;
    }
  }

  private getAssetImage(path: string): string {
    const baseHref = isBrowser()
      ? document.querySelector('base')?.getAttribute('href') || '/'
      : '/';
    const normalizedBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBase}${normalizedPath}`;
  }

  getProductFormat(): string {
    const concentration = this.product?.concentration?.trim() || 'Extrait de parfum';
    const volume = this.product?.volume?.trim() || '30ml';
    return `${concentration} / ${volume}`;
  }

  sendOrderByEmail(): void {
    if (!this.clientName || !this.clientPhone) {
      alert('Veuillez remplir les champs requis.');
      return;
    }

    const templateParams = {
      client_name: this.clientName,
      client_phone: this.clientPhone,
      product_name: this.product.name,
      product_qty: this.quantity,
      product_size: this.product.volume || '30ml'
    };

    emailjs.send('service_kcuy57s', 'template_h29lscf', templateParams, 'wB9UpjweMbFN404_6')
      .then(() => {
        alert('Commande envoyée avec succès par email !');
        this.showOrderForm = false;
      }, (error) => {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        alert('Erreur lors de l\'envoi de la commande.');
      });
  }
}
