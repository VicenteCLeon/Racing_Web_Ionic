import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonLabel, 
  IonButton, 
  IonAccordionGroup, 
  IonAccordion, 
  IonItem,
  ToastController
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ProductService, Product } from '../../services/product';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    FooterComponent, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonLabel, 
    IonButton, 
    IonAccordionGroup, 
    IonAccordion, 
    IonItem
  ]
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  selectedSize: string = 'L';
  quantity: number = 1;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    private cartService: CartService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('id');
      
      if (productId) {
        this.product = null;
        this.loading = true;
        this.quantity = 1;
        this.selectedSize = 'L';

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadProduct(+productId);
        }, 100);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.product = null;
    this.cdr.detectChanges();

    if (this.productService.isUsingBackend()) {
      this.productService.getProductByIdFromAPI(id).subscribe({
        next: (product: Product) => {
          this.product = product;
          this.selectedSize = this.product?.size || 'L';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const product = this.productService.getProductById(id);
      if (product) {
        this.product = product;
        this.selectedSize = this.product?.size || 'L';
        this.loading = false;
        this.cdr.detectChanges();
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }
  }

  addProductToCart(product: Product) {
  console.log('Intentando añadir producto al carrito:', product);
  if (!product || product.id === undefined) {
    console.error('Producto inválido o ID indefinido');
    return;
  }

  let cartId = this.cartService.getCurrentCartId();
  console.log('CartId actual:', cartId);

  if (!cartId) {
    this.cartService.createCart().subscribe(cart => {
      console.log('Carrito creado:', cart);
      this.cartService.setCurrentCartId(cart.id);
      this.sendAddCartItem(cart.id, product);
    });
  } else {
    this.sendAddCartItem(cartId, product);
  }
}


  sendAddCartItem(cartId: number, product: Product) {
  const item: CartItem = {
    cartId,
    productId: product.id!,
    quantity: this.quantity,
    size: this.selectedSize
  };
  console.log('Añadiendo item al carrito:', item);
  this.cartService.addCartItem(item).subscribe({
    next: () => {
      console.log('Item agregado exitosamente');
      this.cartService.notifyCartChanged();
      this.presentToast('Producto añadido al carrito');
    },
    error: (err) => {
      console.error('Error añadiendo item:', err);
    }
  });
}


  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  changeQuantity(amount: number): void {
    const newQuantity = this.quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }
}
