import {
  Component,
  OnInit,
  NgZone,
  AfterViewInit
} from '@angular/core';
import {
  NavigationStart,
  RouterLink,
  RouterOutlet,
  Router,
  ActivatedRoute,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from './arcctv/auth.service';
import { ArcctvService } from './arcctv/arcctv.service';
import { logindb, Staffdb } from './arcctv/dbinterface';
import { HttpClient } from '@angular/common/http';
//import { FooterComponent } from './arcctv/footer/footer.component';
import { HeaderComponent } from './arcctv/header/header.component';



@Component({
  selector: 'app-root',
  standalone: true,
 imports: [
   // RouterOutlet,
   // RouterOutlet,
  //  RouterLink,
  //  FooterComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit {
  private authenticationSub!: Subscription;
  userAuthenticated = false;

  title: String = 'AR Cctv Online';
  dateFormatted: string;
  evntind = 'n'
  wsschapno = '';
  wsschaptitle = '';
  wssviewind = '';
  clID = '';
  logintype = '';
  wsstype = '';
  sign_stat = "n"

  data: any;
  staffdetail: Staffdb = {
    UsStaffcd: '',
    UsStaffname: '',
    UsStaffAddress: '',
    UsHphone: '',
    // Uslevel: '',
    UsPassword: '',
    Usemail: '',
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };
  staffdet: Staffdb[] = [];

  constructor(
    private authService: AuthService,
    private arcctvService: ArcctvService,
    private router: Router,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private http: HttpClient
  ) { }
 ngOnInit(): void {
    this.authService.authenticateFromLocalStorage();

    /*========================================
    *** CHECK IF ADMINSITEATOR exist      ****
    =========================================*/
       this.arcctvService.fldb = 'Staffdb';
    this.arcctvService.fetchAllrecord().subscribe((data) => {
      this.staffdet = data;

         console.log("\n\nthis.staffdet =- " + JSON.stringify(this.staffdet.length))
      if (this.staffdet.length == 0) {
        var staffdetinp: Staffdb;
        this.sign_stat = "n"
        this.staffdetail.UsStaffcd = 'SIG1001';
        this.staffdetail.UsStaffname = 'A Razak Subahan';
        this.staffdetail.UsStaffAddress = 'Tampines';
        this.staffdetail.UsHphone = '81833676';
        //     this.staffdetail.Uslevel = '0';
        this.staffdetail.UsPassword = 'raz';
        this.staffdetail.Usemail = 'arsubahan@yahoo.com';
        this.staffdetail.resetPasswordToken = null;
        this.staffdetail.resetPasswordExpires = null;
        this.authService.authfldb = 'Staffdb';

        this.authService.signup(this.staffdetail).subscribe({
          next: (data) => {
            this.toast.success(
              'Record ' + this.staffdetail.UsStaffcd + ' created successfully',
              'Signup success',
              {
                timeOut: 1500,

              }
            );

          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Signup Error', {
              timeOut: 1500,
            });
          },
        });

      }
    })
  }
  // title = 'my-diary';
}
