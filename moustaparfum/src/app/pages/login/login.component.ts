import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error: string | null = null;
  loading = false;
  showPassword = false;

  private returnUrl = '/admin';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';

    if (this.authService.isAuthenticated) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  login(): void {
    this.error = null;

    if (!this.username.trim() || !this.password) {
      this.error = 'Veuillez saisir votre identifiant et votre mot de passe.';
      return;
    }

    this.loading = true;
    const isLoggedIn = this.authService.login(this.username, this.password);
    this.loading = false;

    if (!isLoggedIn) {
      this.error = 'Identifiants admin incorrects.';
      return;
    }

    this.router.navigateByUrl(this.returnUrl);
  }
}
