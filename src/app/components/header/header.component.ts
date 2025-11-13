import { Component, OnInit, inject, Renderer2, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, FormsModule]
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);

  isMobileMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  currentUser: any = null;

  loginUser = '';
  loginPassword = '';

  constructor(
    private themeService: ThemeService, 
    private renderer: Renderer2, 
    private el: ElementRef,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!this.currentUser;
    this.cd.detectChanges();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }

  goToCart() {
    window.location.href = '/shopcart';
  }

  goToProfile() {
    window.location.href = '/profile';
  }

  goToLogin() {
    window.location.href = '/login';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToHome() {
    window.location.href = '/home';
  }

  goToAccessories() {
    window.location.href = '/accessories';
  }

  goToJackets() {
    window.location.href = '/jackets';
  }

  goToAdminUsers() {
    window.location.href = '/admin/users';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
