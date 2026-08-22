import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';

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
  selectedSize = '30ml';

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe(prod => {
      this.product = prod;
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

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  getProductImage(): string {
    if (!this.product?.imageUrl) {
      return 'assets/parfums/p1.png';
    }

    if (this.product.imageUrl.startsWith('assets/') || this.product.imageUrl.startsWith('http')) {
      return this.product.imageUrl;
    }

    return `http://localhost:9095${this.product.imageUrl}`;
  }

  get hasNotes(): boolean {
    return !!(this.product?.topNotes || this.product?.heartNotes || this.product?.baseNotes);
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
      product_size: this.selectedSize
    };

    emailjs.send('service_kcuy57s', 'template_h29lscf', templateParams, 'wB9UpjweMbFN404_6')
      .then(() => {
        alert('Commande envoyee avec succes par email !');
        this.showOrderForm = false;
      }, (error) => {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        alert('Erreur lors de l\'envoi de la commande.');
      });
  }
}
