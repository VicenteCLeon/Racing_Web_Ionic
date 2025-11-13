import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-shopcart',
  templateUrl: './shopcart.html',
  styleUrls: ['./shopcart.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})
export class ShopcartPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  cartItems: CartItem[] = [];
  shippingCost: number = 5000;
  currentCartId: number | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  ionViewWillEnter() {
    this.scrollToTop();
  }

  ionViewDidEnter() {
    this.scrollToTop();
  }

  scrollToTop() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToTop(0);
      }
    }, 100);
  }

  loadCart() {
    this.cartService.getUserCart().subscribe({
      next: (data) => {
        this.currentCartId = data.id;
        this.cartItems = data.items || [];
      },
      error: (err) => {
        console.error('Error cargando carrito:', err);
      }
    });
  }

  increaseQuantity(index: number) {
    const item = this.cartItems[index];
    const newQuantity = item.quantity + 1;
    this.cartService.updateCartItem(item.id!, newQuantity).subscribe(() => this.loadCart());
  }

  decreaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.cartService.updateCartItem(item.id!, newQuantity).subscribe(() => this.loadCart());
    }
  }

  async removeItem(index: number) {
    const item = this.cartItems[index];
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.cartService.removeCartItem(item.id!).subscribe(() => this.loadCart());
          }
        }
      ]
    });

    await alert.present();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    // Asegura que item.product exista y tenga el campo precio
    return this.cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + this.shippingCost;
  }

  async checkout() {
    if (this.cartItems.length === 0) {
      const alert = await this.alertController.create({
        header: 'Carrito vacío',
        message: 'Agrega productos antes de finalizar la compra',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }
}
