import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, AuthRequest } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  imports: [FormsModule, CommonModule],
})
export class SigninComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  isLoading = false;
  errorMessage = '';

  private tokenSub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect on token expiration to sign-in page
    this.tokenSub = this.authService.tokenExpired$.subscribe(expired => {
      if (expired) {
        this.router.navigate(['/signin']);
        window.alert('Please log in again. Your session has expired.');
      }
    });
  }

  ngOnDestroy(): void {
    this.tokenSub?.unsubscribe();
  }

  onSignIn(): void {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: AuthRequest = {
      email: this.email.trim(),
      password: this.password,
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.authService.saveToken(response.token, this.email.trim());

        this.router.navigate(['/dashboard']).catch(err => {
          console.error('Navigation error:', err);
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }
}
