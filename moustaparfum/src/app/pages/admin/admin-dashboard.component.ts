import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

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

  constructor(private productService: ProductService) {}

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
        console.log('Produits chargés:', data);
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
      price: 0, // Revenu à 0 pour respecter le type number
      inStock: true
    };
  }

  // Nouvelle méthode pour gérer la sélection de fichier
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérification du type de fichier
      if (!file.type.startsWith('image/')) {
        this.error = 'Veuillez sélectionner un fichier image valide';
        return;
      }

      // Vérification de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La taille de l\'image ne doit pas dépasser 5MB';
        return;
      }

      this.selectedFile = file;
      
      // Création de l'aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.clearMessages();
    }
  }

  // Méthode pour vérifier si le formulaire peut être soumis
  canSubmit(): boolean {
    return !!(
      this.newProduct.name &&
      this.newProduct.brand &&
      this.newProduct.category &&
      this.newProduct.price > 0 &&
      this.newProduct.description &&
      (this.selectedFile || this.newProduct.imageUrl)
    );
  }
  

  // Méthode pour supprimer l'image sélectionnée
  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.newProduct.imageUrl = '';
  }

  // Méthode pour convertir le fichier en base64 ou gérer l'upload


  // Méthode optionnelle pour uploader vers le serveur


  async saveProduct(): Promise<void> {
    if (!this.newProduct.name || !this.newProduct.brand || this.newProduct.price <= 0) {
      this.error = 'Veuillez remplir tous les champs obligatoires (nom, marque, prix)';
      return;
    }
  
    this.loading = true;
    this.error = null;
    this.success = null;
  
    try {
      // 📌 Choix entre image uploadée et image locale
      if (this.selectedFile) {
        this.newProduct.imageUrl = await this.uploadImageToServer(this.selectedFile);
      } else if (this.selectedFromAssets) {
        this.newProduct.imageUrl = 'assets/parfums/' + this.selectedFromAssets;
      }
  
      // 🔁 Suite logique CRUD
      const { id, ...productToCreate } = this.newProduct;
  
      if (this.newProduct.id && this.newProduct.id > 0) {
        this.productService.update(this.newProduct.id, this.newProduct).subscribe({
          next: (response) => {
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
          next: (response) => {
            this.success = 'Produit ajouté avec succès';
            this.loadProducts();
            this.resetFormAndImage();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors de l\'ajout du produit';
            this.loading = false;
            console.error('Erreur create:', err);
          }
        });
      }
    } catch (error) {
      this.error = 'Erreur lors du traitement de l\'image';
      this.loading = false;
      console.error('Erreur image:', error);
    }
  }
  
  

  public resetFormAndImage(): void {
    this.newProduct = this.resetForm();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  editProduct(prod: Product): void {
    this.newProduct = { ...prod };
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
    this.success = null;
  }

  deleteProduct(id: number): void {
    if (confirm("Confirmer la suppression ?")) {
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

  private async uploadImageToServer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
  
    const response = await fetch('http://localhost:9095/api/upload', {
      method: 'POST',
      body: formData
    });
  
    if (!response.ok) {
      throw new Error("Erreur HTTP lors de l'envoi de l'image");
    }
  
    const result = await response.json();
    return result.imageUrl; // /uploads/xxx.jpg
  }
  

  allowOnlyNumeric(event: KeyboardEvent): void {
    const allowedChars = ['0','1','2','3','4','5','6','7','8','9','.','‚',','];
    const inputChar = event.key;
  
    // Refuser toute autre touche
    if (!allowedChars.includes(inputChar)) {
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



  }
  
  
  
  
  
  
  
