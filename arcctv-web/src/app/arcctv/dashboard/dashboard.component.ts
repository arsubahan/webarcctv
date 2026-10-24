import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
 imports: [ RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  implements OnInit {
  //userAuthenticated = false;
  staffid = '';
  staffname = ''
  sessiontype = '';

  constructor(private authService: AuthService) {}

  // ngOnDestroy(): void {
  //   this.authenticationSub.unsubscribe();
  // }

  ngOnInit(): void {
      this.staffid = sessionStorage.getItem("staffid")
      this.staffname = sessionStorage.getItem("Staffname")
       this.sessiontype = sessionStorage.getItem("stype")
    }

  logout() {
    this.authService.logout();
  }
}
