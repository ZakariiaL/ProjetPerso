import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

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
  isMobile = window.innerWidth < 768;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });

    this.productService.getAll().subscribe((all: Product[]) => {
      this.route.paramMap.subscribe(params => {
        const type = params.get('type');
        this.products = type
          ? all.filter((p: Product) => p.category?.toLowerCase() === type.toLowerCase())
          : all;
      });
    });
  }

  get pagedProducts(): Product[] {
    const start = this.currentPage * this.itemsPerPageMobile;
    return this.products.slice(start, start + this.itemsPerPageMobile);
  }

  get pageCount(): number {
    return Math.ceil(this.products.length / this.itemsPerPageMobile);
  }

  changePage(index: number) {
    this.currentPage = index;
  }

  get groupedProducts(): Product[][] {
    const grouped: Product[][] = [];
    for (let i = 0; i < this.products.length; i += 4) {
      grouped.push(this.products.slice(i, i + 4));
    }
    return grouped;
  }
}
