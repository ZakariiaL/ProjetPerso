import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, CreateProductRequest } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { isBrowser } from '../../utils/platform';

type AdminMode = 'create' | 'edit';
type SortKey = 'recent' | 'name' | 'priceAsc' | 'priceDesc' | 'stock';

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  formProduct: Product = this.createBlankProduct();

  mode: AdminMode = 'create';
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  searchTerm = '';
  categoryFilter = 'all';
  stockFilter: 'all' | 'in' | 'out' = 'all';
  sortKey: SortKey = 'recent';
  currentPage = 1;
  itemsPerPage = 8;

  readonly categories: CategoryOption[] = [
    { value: 'homme', label: 'Homme', icon: 'male' },
    { value: 'femme', label: 'Femme', icon: 'female' },
    { value: 'niche', label: 'Niche', icon: 'diamond' },
    { value: 'ambiances', label: 'Ambiances', icon: 'spa' }
  ];

  readonly concentrations = ['Extrait de parfum', 'Eau de parfum', 'Parfum d’ambiance', 'Brume parfumée'];
  readonly volumes = ['30ml', '50ml', '100ml', '250ml'];

  constructor(
    private productService: ProductService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAdminProducts().subscribe({
      next: (data) => {
        this.products = this.normalizeProducts(data);
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger le catalogue. Vérifie que le backend est lancé.';
        this.loading = false;
        console.error('Erreur loadProducts:', err);
      }
    });
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get inStockCount(): number {
    return this.products.filter((product) => product.inStock).length;
  }

  get outOfStockCount(): number {
    return this.products.filter((product) => !product.inStock).length;
  }

  get filteredProducts(): Product[] {
    const cleanSearch = this.searchTerm.trim().toLowerCase();

    return this.products
      .filter((product) => {
        const matchesSearch = !cleanSearch || [
          product.name,
          product.brand,
          product.category,
          product.description,
          product.concentration,
          product.volume
        ].some((value) => String(value || '').toLowerCase().includes(cleanSearch));

        const matchesCategory = this.categoryFilter === 'all' || this.normalizeCategory(product.category, product) === this.categoryFilter;
        const matchesStock = this.stockFilter === 'all'
          || (this.stockFilter === 'in' && product.inStock)
          || (this.stockFilter === 'out' && !product.inStock);

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => this.sortProducts(a, b));
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
  }

  get isEditing(): boolean {
    return this.mode === 'edit' && this.formProduct.id > 0;
  }

  get canSubmit(): boolean {
    return !!(
      this.formProduct.name.trim()
      && this.formProduct.brand.trim()
      && this.formProduct.category
      && this.formProduct.volume?.trim()
      && Number(this.formProduct.price) >= 0
      && (this.selectedFile || this.formProduct.imageUrl)
    );
  }

  get previewImage(): string | null {
    if (this.imagePreview) {
      return this.imagePreview;
    }

    if (this.formProduct.imageUrl) {
      return this.getProductImage(this.formProduct);
    }

    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Sélectionne un fichier image valide.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La taille de l’image ne doit pas dépasser 5 Mo.';
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

  async saveProduct(): Promise<void> {
    if (!this.canSubmit) {
      this.error = 'Remplis les champs obligatoires avant d’enregistrer.';
      return;
    }

    this.saving = true;
    this.loading = true;
    this.error = null;
    this.success = null;

    try {
      const productPayload = this.prepareProductPayload();

      if (this.selectedFile) {
        productPayload.imageUrl = await this.uploadImageToServer(this.selectedFile);
      }

      if (this.isEditing) {
        this.productService.update(this.formProduct.id, { ...productPayload, id: this.formProduct.id }).subscribe({
          next: () => this.handleSaved('Parfum modifié avec succès.'),
          error: (err) => this.handleSaveError(err, 'Erreur lors de la modification du parfum.')
        });
      } else {
        const { id, ...productToCreate } = productPayload;
        this.productService.create(productToCreate as CreateProductRequest).subscribe({
          next: () => this.handleSaved('Parfum ajouté avec succès.'),
          error: (err) => this.handleSaveError(err, 'Erreur lors de l’ajout du parfum.')
        });
      }
    } catch (error) {
      this.error = 'Erreur pendant l’envoi de l’image.';
      this.loading = false;
      this.saving = false;
      console.error('Erreur image:', error);
    }
  }

  editProduct(product: Product): void {
    this.mode = 'edit';
    this.formProduct = {
      ...this.createBlankProduct(),
      ...product,
      category: this.normalizeCategory(product.category, product),
      concentration: product.concentration || 'Extrait de parfum',
      volume: this.normalizeVolume(product.volume),
      price: Number(product.price || 0)
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.clearMessages();
    this.scrollToForm();
  }

  duplicateProduct(product: Product): void {
    this.mode = 'create';
    this.formProduct = {
      ...this.createBlankProduct(),
      ...product,
      id: 0,
      name: `${product.name} - copie`,
      category: this.normalizeCategory(product.category, product),
      imageUrl: product.imageUrl
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.success = 'Produit dupliqué. Tu peux ajuster les champs puis enregistrer.';
    this.error = null;
    this.scrollToForm();
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Supprimer définitivement "${product.name}" ?`);

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.success = 'Produit supprimé avec succès.';
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression du produit.';
        this.loading = false;
        console.error('Erreur delete:', err);
      }
    });
  }

  resetForm(): void {
    this.mode = 'create';
    this.formProduct = this.createBlankProduct();
    this.selectedFile = null;
    this.imagePreview = null;
    this.clearMessages();
  }

  toggleStock(product: Product): void {
    const updatedProduct: Product = {
      ...product,
      inStock: !product.inStock,
      category: this.normalizeCategory(product.category, product)
    };

    this.loading = true;
    this.productService.update(product.id, updatedProduct).subscribe({
      next: () => {
        this.success = updatedProduct.inStock ? 'Produit remis en stock.' : 'Produit marqué en rupture.';
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Impossible de modifier le stock.';
        this.loading = false;
        console.error('Erreur stock:', err);
      }
    });
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.formProduct.imageUrl = '';
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = 'all';
    this.stockFilter = 'all';
    this.sortKey = 'recent';
    this.currentPage = 1;
  }

  changePage(nextPage: number): void {
    this.currentPage = Math.min(Math.max(nextPage, 1), this.totalPages);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  allowOnlyNumeric(event: KeyboardEvent): void {
    const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ','];

    if (!allowedChars.includes(event.key)) {
      event.preventDefault();
    }
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

  getCategoryLabel(category: string | undefined): string {
    const normalized = this.normalizeCategory(category);
    return this.categories.find((item) => item.value === normalized)?.label || 'Niche';
  }

  getCategoryIcon(category: string | undefined): string {
    const normalized = this.normalizeCategory(category);
    return this.categories.find((item) => item.value === normalized)?.icon || 'sell';
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  private createBlankProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      brand: 'Moustaparfum',
      category: 'homme',
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

  private prepareProductPayload(): Product {
    return {
      ...this.formProduct,
      name: this.formProduct.name.trim(),
      brand: this.formProduct.brand.trim(),
      category: this.normalizeCategory(this.formProduct.category, this.formProduct),
      description: this.formProduct.description.trim(),
      imageUrl: this.formProduct.imageUrl,
      price: Number(String(this.formProduct.price).replace(',', '.')) || 0,
      concentration: this.formProduct.concentration?.trim() || 'Extrait de parfum',
      volume: this.normalizeVolume(this.formProduct.volume),
      topNotes: this.formProduct.topNotes?.trim() || '',
      heartNotes: this.formProduct.heartNotes?.trim() || '',
      baseNotes: this.formProduct.baseNotes?.trim() || ''
    };
  }

  private normalizeProducts(products: Product[]): Product[] {
    return products.map((product) => ({
      ...product,
      price: Number(product.price || 0),
      category: this.normalizeCategory(product.category, product),
      inStock: Boolean(product.inStock),
      concentration: product.concentration?.trim() || 'Extrait de parfum',
      volume: this.normalizeVolume(product.volume)
    }));
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

  private normalizeCategory(category: string | undefined, product?: Partial<Product>): string {
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

  private sortProducts(a: Product, b: Product): number {
    switch (this.sortKey) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'priceAsc':
        return Number(a.price) - Number(b.price);
      case 'priceDesc':
        return Number(b.price) - Number(a.price);
      case 'stock':
        return Number(b.inStock) - Number(a.inStock);
      case 'recent':
      default:
        return Number(b.id || 0) - Number(a.id || 0);
    }
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
      throw new Error('Erreur HTTP lors de l’envoi de l’image');
    }

    const result = await response.json();
    return result.imageUrl;
  }

  private handleSaved(message: string): void {
    this.mode = 'create';
    this.formProduct = this.createBlankProduct();
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
    this.loadProducts();
    this.success = message;
    this.saving = false;
  }

  private handleSaveError(error: unknown, message: string): void {
    this.error = message;
    this.loading = false;
    this.saving = false;
    console.error('Erreur save:', error);
  }

  private scrollToForm(): void {
    if (isBrowser()) {
      setTimeout(() => {
        document.querySelector('.admin-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
}
