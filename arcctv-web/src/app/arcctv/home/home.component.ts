import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    // private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  //constructor() { }
  wssmode = ''

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.wssmode = queryParams['sectype'];
    });

    this.loginForm = new FormGroup({
      clcode: new FormControl(this.wssmode, [Validators.required]),
      clpassword: new FormControl('', [Validators.required])
    })

  }

  onSubmit() {
    // console.log('\n\non submit = ' + JSON.stringify(this.loginForm.value));
    this.authService.authfldb = 'clientdb';
    this.authService.authflid = this.loginForm.value.clcode;


    this.authService.authfltype = "C"
    this.authService.loginUser(
      this.loginForm.value.clcode.toUpperCase(),
      this.loginForm.value.clpassword
    );

    // }
  }

  forgotpasword() {

    this.router.navigate(['/forgotpassword'], { queryParams: { wssmode: this.wssmode } })

  }
}
