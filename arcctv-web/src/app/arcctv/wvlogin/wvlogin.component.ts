import { Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ArcctvService } from './../arcctv.service';
import { Clientdb } from '../dbinterface';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-wvlogin',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './wvlogin.component.html',
    styleUrl: './wvlogin.component.css'
})
export class WvloginComponent implements OnInit {
    loginForm: FormGroup;

    fcmToken = '';
    private authenticationSub: Subscription;
    userAuthenticated: boolean = false;

    clientdetail: Clientdb = {
        clcode: '',
        cltype: '',
        clname: '',
        claddress: '',
        clcontactno: '',
        clemail: '',
        cldatereg: '',
        clpassword: '',
        clandtoken: [],
        resetPasswordToken: null,
        resetPasswordExpires: null,

    }
    clientdet: Clientdb[] = []


    constructor(
        private AuthService: AuthService,
        private arcctvService: ArcctvService,
        private toast: ToastrService,
        private route: ActivatedRoute,
        private router: Router
    ) { }
    //constructor() { }
    wssmode = ''

    username = '';
    password = '';



    ngOnInit(): void {
        this.route.queryParams.subscribe((queryParams) => {
            this.wssmode = queryParams['sectype'];
        });

        this.loginForm = new FormGroup({
            clcode: new FormControl('', [Validators.required]),
            clpassword: new FormControl('', [Validators.required]),
            clToken: new FormControl('', [Validators.nullValidator]),
        })

        // Receive the token sent from Android.

        const wind = window as any;

        wind.receiveFCMToken = (token: string) => {
            this.fcmToken = token;
        };

        // Handle a token received before Angular initialized.
        if (wind.__androidFcmToken) {
            this.fcmToken = wind.__androidFcmToken;
            this.loginForm.patchValue({ clToken: this.fcmToken });
        }

        //   this.toast.success('\n\nthis.fcmToken = ' + this.fcmToken);

    }

    async copyToken(): Promise<void> {
        if (!this.fcmToken) return;

        await navigator.clipboard.writeText(this.fcmToken);
        this.toast.success(
            '\n\nclipboard = ' + navigator.clipboard.writeText(this.fcmToken),
            'Login Success',
            {
                timeOut: 2000,
            });
    }


    async cmdupdate(inpdet) {
        console.log('\n\non submit = ' + JSON.stringify(inpdet));

        var andtoken = this.loginForm.value.clToken;
        this.AuthService.authfldb = 'clientdb';
        this.AuthService.authflid = inpdet.clcode;

        this.username = inpdet.clcode;
        this.password = inpdet.clpassword;


        this.AuthService.authfltype = "W" //web client login
        if (this.loginForm.valid) {
            this.AuthService.loginUser(
                inpdet.clcode.toUpperCase(),
                inpdet.clpassword
            );
            //    if (this.AuthService.authind == "ok") {
            this.userAuthenticated = await this.AuthService.getIsAuthenticated();
            this.authenticationSub = await this.AuthService.getAuthenticatedSub().subscribe(async status => {
                this.userAuthenticated = await status;
                if (this.userAuthenticated) { // && this.fcmToken) {
                    this.arcctvService.fldb = 'clientdb';
                    //var test = { evntgalcd: this.eventcd };
                    this.arcctvService.varsrch = { clcode: inpdet.clcode.toUpperCase() };
                    this.arcctvService.fetchcrit().subscribe(async (data) => {
                        this.clientdetail = data[0];

                        console.log('\n\ninpdet.clToken = ' + JSON.stringify(andtoken) + "  inpdet.clToken = " + JSON.stringify(this.clientdetail.clandtoken));

                        // if (!this.clientdetail.clandtoken.includes(this.loginForm.value.clToken)) {
                        // if(this.clientdetail[0].clandtoken.includes(andtoken)) {
                        if (!Array.isArray(this.clientdetail.clandtoken)) {
                            this.clientdetail.clandtoken = [];
                            prompt('clandtoken is not an array. Please check the data structure.');
                        }
                        this.toast.success('Record updated successfully', inpdet.clToken, {
                            timeOut: 3500,
                        });
                        if (!this.clientdetail.clandtoken.includes(inpdet.clToken) && !(inpdet.clToken == '')) {
                            this.clientdetail.clandtoken.push(inpdet.clToken);
                            this.arcctvService.updateitem(this.clientdetail).subscribe((data) => {
                                this.toast.success('Record updated successfully', 'Client Form', {
                                    timeOut: 1500,
                                });
                            });

                        } 
                         else {
                            this.toast.info('Token already exists', inpdet.clToken, {
                                timeOut: 3500,
                            });
                        }
                        // }
                    })
                   /* await this.toast.success(
                        '\n\nafterthis.userAuthenticated = ' + this.userAuthenticated,
                        'Login Success',
                        {
                            timeOut: 2000,
                        }); */

                    const android = (window as any).Android;

                    if (android?.saveLogin) {
                        android.saveLogin(
                            this.username,
                            this.password
                        );
                    }

                    this.router.navigate(['/wvhome'], { queryParams: { loginind: this.AuthService.authfltype} });

                } // end of if (this.userAuthenticated && this.fcmToken)
            })
        }
        // console.log('\n\nbefore this authService.authind = ' + this.authService.authind);


        // if (this.AuthService.authind == "ok") {
        //     // this.router.navigate(['/wvhome'], { queryParams: { loginind: this AuthService.authfltype } });
        //     console.log('\n\nafter this AuthService.authind = ' + this.AuthService.authind);
        //     this.toast.success(
        //         '\n\nafter this AuthService.authind = ' + this.AuthService.authind,
        //         'Login Success',
        //         {
        //             timeOut: 2000,
        //         });

        //         this.AuthService.authind = "nok";


        // }
    }
    // }
    //}

    // onSubmit() {


    //     this.authService.authfldb = 'clientdb';
    //     this.authService.authfltype = "W";  //web client login
    //     this.authService.authToken = this.loginForm.value.clToken;
    //     if (!this.authService.loginUser(
    //         this.loginForm.value.clcode.toUpperCase(),
    //         this.loginForm.value.clpassword,
    //     )) {
    //         // this.router.navigate(['/wvhome'], { queryParams: { loginind: this.authService.authfltype } });
    //     } else {
    //         this.toast.error('Login failed. Please check your credentials.', 'Login Error', {
    //             timeOut: 3000,
    //         });
    //     }



    // }


    forgotpasword() {

        this.router.navigate(['/forgotpassword'], { queryParams: { wssmode: this.wssmode } })

    }

}
