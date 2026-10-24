import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { formatDate } from '@angular/common';
import { AuthService } from './../auth.service';
import { ArcctvService } from './../arcctv.service';
import { logindb, Staffdb } from './../dbinterface';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from './../footer/footer.component';
import {
  NavigationStart,
  RouterLink,
  RouterOutlet,
  Router,
  ActivatedRoute,
} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FooterComponent,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authenticationSub: Subscription;
  userAuthenticated: boolean = false;
  dateFormatted: string;
  logintype: string;
  clID: string;
  wviewindex:boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService) {
    this.dateFormatted = formatDate(new Date(), 'dd MMMM yyyy', 'en-US');
  }

  async ngOnInit() {

    const title = 'angular-toolbar-dropdown';
    this.router.events.subscribe((event) => {
          // console.log('WORK!!!!!!!!!!!' + JSON.stringify(event.url) + "\n\n");

      if (event instanceof NavigationStart) {
     
        if (event.url.includes('/wvlogin')) {
          // Display your custom dialog here, e.g., by setting a flag to open it.
       //   console.log('WORK!!!!!!!!!!!' + JSON.stringify(event.url) + "\n\n");
          this.wviewindex = true;
        }
       //  console.log("\n\n this.wviewindex = " + this.wviewindex +   "     event.url =  " + event.url);
      }

     

    })

    this.userAuthenticated = await this.authService.getIsAuthenticated();
    this.authenticationSub = await this.authService.getAuthenticatedSub().subscribe(async status => {
      this.userAuthenticated = await status;

      console.log("\n\n this.userAuthenticated = " + this.userAuthenticated);

      if (this.userAuthenticated) {
        this.logintype = sessionStorage.getItem("stype");
        this.clID = sessionStorage.getItem("staffid") || '';
        console.log("\n\nlogintype = " + this.logintype + '     his.clID =  ' + this.clID + "          this.userAuthenticated = " + this.userAuthenticated);
      } else {
        console.log("\n\nnot logintype = " + this.logintype + '     his.clID =  ' + this.clID + "          this.userAuthenticated = " + this.userAuthenticated);

      }




    })



  }

  selectOption(option: string) {
    console.log(`Selected option: ${option}`);
  }


  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authenticationSub.unsubscribe();
  }

} 