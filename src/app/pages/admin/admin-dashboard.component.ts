import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = this.resetForm();
  loading = false;
  error: string | null = null;
  success: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  selectedFromAssets: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
        console.error('Erreur loadProducts:', err);
      }
    });
  }

  resetForm(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      brand: '',
      category: '',
      imageUrl: '',
      price: 0,
      inStock: true,
      concentration: 'Extrait de parfum',
      volume: '30ml',
      topNotes: '',
      heartNotes: '',
      baseNotes: ''
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner un fichier image valide';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La taille de l’image ne doit pas dépasser 5 Mo';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = String(e.target?.result || '');
    };
    reader.readAsDataURL(file);
    this.clearMessages();
  }

  canSubmit(): boolean {
    return !!(
      this.newProduct.name &&
      this.newProduct.brand &&
      this.newProduct.category &&
      this.newProduct.price > 0 &&
      (this.selectedFile || this.newProduct.imageUrl)
    );
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.newProduct.imageUrl = '';
  }

  async saveProduct(): Promise<void> {
    if (!this.newProduct.name || !this.newProduct.brand || this.newProduct.price <= 0) {
      this.error = 'Veuillez remplir les champs obligatoires';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    try {
      if (this.selectedFile) {
        this.newProduct.imageUrl = await this.uploadImageToServer(this.selectedFile);
      } else if (this.selectedFromAssets) {
        this.newProduct.imageUrl = 'assets/parfums/' + this.selectedFromAssets;
      }

      const { id, ...productToCreate } = this.newProduct;

      if (this.newProduct.id && this.newProduct.id > 0) {
        this.productService.update(this.newProduct.id, this.newProduct).subscribe({
          next: () => {
            this.success = 'Produit modifié avec succès';
            this.loadProducts();
            this.resetFormAndImage();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors de la modification du produit';
            this.loading = false;
            console.error('Erreur update:', err);
          }
        });
      } else {
        this.productService.create(productToCreate).subscribe({
          next: () => {
            this.success = 'Produit ajouté avec succès';
            this.loadProducts();
            this.resetFormAndImage();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors de l ajout du produit';
            this.loading = false;
            console.error('Erreur create:', err);
          }
        });
      }
    } catch (error) {
      this.error = 'Erreur lors du traitement de l image';
      this.loading = false;
      console.error('Erreur image:', error);
    }
  }

  resetFormAndImage(): void {
    this.newProduct = this.resetForm();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  editProduct(prod: Product): void {
    this.newProduct = {
      ...this.resetForm(),
      ...prod,
      concentration: prod.concentration || 'Extrait de parfum',
      volume: prod.volume || '30ml'
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
    this.success = null;
  }

  deleteProduct(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.loading = true;
      this.error = null;

      this.productService.delete(id).subscribe({
        next: () => {
          this.success = 'Produit supprimé avec succès';
          this.loadProducts();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          this.loading = false;
          console.error('Erreur delete:', err);
        }
      });
    }
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  allowOnlyNumeric(event: KeyboardEvent): void {
    const allowedChars = ['0','1','2','3','4','5','6','7','8','9','.',','];

    if (!allowedChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
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

  getPreviewImage(): string {
    if (this.imagePreview) {
      return this.imagePreview;
    }

    return this.getProductImage(this.newProduct);
  }

  private async uploadImageToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const authorization = this.authService.getAuthorizationHeader();

    const response = await fetch('http://localhost:9095/api/upload', {
      method: 'POST',
      body: formData,
      headers: authorization ? { Authorization: authorization } : undefined
    });

    if (!response.ok) {
      throw new Error('Erreur HTTP lors de l envoi de l image');
    }

    const result = await response.json();
    return result.imageUrl;
  }
}
