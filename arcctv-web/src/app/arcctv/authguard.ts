import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
     if (this.authService.getIsAuthenticated()) {
      return true; // Allow access to the route
    } else {
      // Redirect to the login page
      this.router.navigate(['/home']);
      return false;
     }

      return true // remove after testting
  }

}