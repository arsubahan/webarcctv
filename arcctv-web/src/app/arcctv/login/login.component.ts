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



@Component({
  selector: 'app-login',
  standalone: true,
   imports: [
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
    ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    constructor(
        private authService: AuthService,
        private toast: ToastrService,
        private route: ActivatedRoute,
        private router: Router
    ) { }
    //constructor() { }
    wssmode = ''


    ngOnInit(): void {
        this.loginForm = new FormGroup({
            UsStaffcd: new FormControl('', [Validators.required]),
            UsPassword: new FormControl('', [Validators.required]),
        })


    }

    onSubmit() {
        this.route.queryParams.subscribe((queryParams) => {
            this.wssmode = queryParams['sectype'];
        });

        // console.log('\n\non submit = ' + JSON.stringify(this.loginForm.value));
        this.authService.authfldb = 'Staffdb';
        this.authService.authflid = this.loginForm.value.UsStaffcd;

        this.authService.authfltype = "A"
        this.authService.loginUser(
            this.loginForm.value.UsStaffcd.toUpperCase(),
            this.loginForm.value.UsPassword
        );

    }



    forgotpasword() {

        this.router.navigate(['/forgotpassword'], { queryParams: { wssmode: this.wssmode } })

    }
}
