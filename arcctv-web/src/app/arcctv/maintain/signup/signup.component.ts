import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { formatDate, Location } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ArcctvService } from '../../arcctv.service';
import { AuthService, clmatchpassword, matchpassword } from '../../auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Clientdb, Staffdb } from '../../dbinterface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-signup',
  standalone: true,
imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginator,
    MatSortModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  router = inject(Router);
  location = inject(Location)

  verpassword = '';
  wssmode = '';
  signupForm: FormGroup;
  signmodForm: FormGroup;
  clientForm: FormGroup;
  clientmodForm: FormGroup;
  runnodet = {};
  wss_id;
  signuptype = '';

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


  staffdetail: Staffdb = {
    UsStaffcd: '',
    //   Uslevel: '',
    UsStaffname: '',
    UsStaffAddress: '',
    UsHphone: '',
    UsPassword: '',
    Usemail: '',
    resetPasswordToken: null,
    resetPasswordExpires: null,

  };
  staffdet: Staffdb[] = [];

  filteredStaffdet: Staffdb[] = [];

  displayedColumns: string[] = [
    'UsStaffcd',
    'UsStaffname',
    'UsStaffAddress',
    'Usemail',
    'UsHphone',
    'Edit',
    'Delete',
  ];
  dataSource = new MatTableDataSource<Staffdb>();

  @ViewChild('UsStaffcd') UsStaffcd: any = '';
  @ViewChild('UsStaffname') UsStaffname: any = '';

  @ViewChild(MatSort) sort: any;
  @ViewChild(MatPaginator) paginator: any;

  constructor(
    private AuthService: AuthService,
    private arcctvService: ArcctvService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }



  ngOnInit(): void {
    //  alert("doing on init signon")
    if (this.AuthService.getIsAuthenticated) {
      this.route.queryParams.subscribe((queryParams) => {
        this.wssmode = queryParams['wssmode'];
        this.signuptype = queryParams['signtype'];
        //  this.AuthService.isStart = queryParams['wsstart']

      });

      if (sessionStorage.getItem("stype") != null) {
        this.signuptype = sessionStorage.getItem("stype").toUpperCase()
      }

      // if (this.signuptype) {

      //   this.signuptype = this.signuptype.toUpperCase()
      //  }

      if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
        this.signuptype == 'A'
      }

      console.log("\n\nsigntype = " + this.signuptype + "     wssmode = " + this.wssmode)


      if (this.signuptype == 'A') {
        this.signupForm = new FormGroup(
          {
            UsStaffcd: new FormControl(null),
            //           Uslevel: new FormControl('A'),
            UsStaffname: new FormControl(null, Validators.required),
            UsStaffAddress: new FormControl(null, Validators.required),
            UsHphone: new FormControl(null, Validators.required),
            Usemail: new FormControl(null, [Validators.required, Validators.email]),
            UsPassword: new FormControl(null, Validators.required),
            verPassword: new FormControl(null),
          },
          {
            validators: matchpassword,
          }
          //console.log("\n\nlocation search = " + $location.search().wssmode)
        );
      }
      if (this.signuptype == 'C') {
        this.clientForm = new FormGroup(
          {
            clcode: new FormControl(null),
            cltype: new FormControl('C'),
            clname: new FormControl(null, Validators.required),
            claddress: new FormControl(null, Validators.required),
            clcontactno: new FormControl(null, Validators.required),
            clemail: new FormControl(null, [Validators.required, Validators.email]),
            cldatereg: new FormControl(formatDate(new Date(), 'dd MMMM yyyy', 'en-US'), Validators.required),
            clandtoken: new FormControl(null),
            clpassword: new FormControl(null, Validators.required),
            verpassword: new FormControl(null),

          },
          {
            validators: clmatchpassword,
          }
          //console.log("\n\nlocation search = " + $location.search().wssmode)
        );


      }
      this.signmodForm = new FormGroup({
        UsStaffcd: new FormControl(null),
        UsStaffname: new FormControl(null, [Validators.required]),
      });

      if (this.wssmode == 'Maintenance') {
        //  alert("doing maintenance")
        this.arcctvService.fldb = 'Staffdb';
        this.arcctvService.fetchAllrecord().subscribe((data) => {
          this.staffdet = data;
          this.dataSource = new MatTableDataSource<Staffdb>(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      }
    } else {
      this.toast.error('please login', 'autentication');
    }



    //end for OnInit
  } //end for export

  populate(Stfdet: Staffdb) {

    this.wssmode = 'Modify';
    this.signuptype == 'A';

    console.log("\n\nStfdet = " + JSON.stringify(Stfdet))



    this.signupForm.setValue({
      UsStaffcd: Stfdet.UsStaffcd,
      // Uslevel: Stfdet.Uslevel,
      UsStaffname: Stfdet.UsStaffname,
      UsStaffAddress: Stfdet.UsStaffAddress,
      UsHphone: Stfdet.UsHphone,
      Usemail: Stfdet.Usemail,
      UsPassword: Stfdet.UsPassword,
      verPassword: Stfdet.UsPassword,
    });

    this.staffdetail = Stfdet;

    console.log("\n\npopulate = " + JSON.stringify(Stfdet))


    // console.log(
    //   '\n\n this.signupForm = ' + JSON.stringify(this.signupForm.value)
    // );
  }

  reset(clty: String) {
    if (clty == 'A') {
      this.signupForm.setValue({
        UsStaffcd: '',
        // Uslevel: '',
        UsStaffname: '',
        UsStaffAddress: '',
        UsHphone: '',
        Usemail: '',
        UsPassword: '',
        verPassword: '',
      });
    } else {
      this.clientForm.setValue({
        clcode: '',
        cltype: '',
        clname: '',
        claddress: '',
        clcontactno: '',
        clemail: '',
        cldatereg: '',
        clandtoken: '',
        clpassword: '',
        verpassword: ''
      })

    }
  }

  searchFilter() {
    this.filteredStaffdet = [];
    let filterObject: any = {
      UsStaffcd: this.UsStaffcd.nativeElement.value,
      UsStaffname: this.UsStaffname.nativeElement.value,
    };
    for (let i = 0; i < this.staffdet.length; i++) {
      let isStringExist: boolean;
      for (let key in filterObject) {
        console.log("\n\nthis.staffdet[" + i + "][" + key + "] = " + this.staffdet[i][key] + "    filter obj = " + JSON.stringify(filterObject))

        if (key == 'stfcd') {
          isStringExist =
            this.staffdet[i][key].toString().indexOf(filterObject[key]) > -1;
        } else {
          if (this.staffdet[i][key]) {
            isStringExist =
              this.staffdet[i][key]
                .toUpperCase()
                .indexOf(filterObject[key].toUpperCase()) > -1;
          } else if (!this.staffdet[i][key] && filterObject[key] !== '') {
            isStringExist = false;
          }
        }
        if (isStringExist == false) {
          break;
        }
      }
      if (isStringExist) {
        this.filteredStaffdet.push(this.staffdet[i]);
      }
    }
    this.dataSource = new MatTableDataSource<Staffdb>(this.filteredStaffdet);
  }

  // addupdate(staffdetinp: any) {
  //   //Add Staff
  //   if (this.signuptype == 'A') {
  //     this.updateadmin(staffdetinp)
  //   } else {
  //     this.updateclient(staffdetinp)
  //   }
  // }


  updateadmin(datainp: Staffdb) {
    if (datainp.UsStaffcd == null) {
      datainp.resetPasswordToken = null;
      datainp.resetPasswordExpires = null;

      datainp.UsPassword = this.signupForm.value.UsPassword;
      console.log(
        '\n\nstaffdetinp = ' +
        JSON.stringify(datainp) +
        '    password = ' +
        this.signupForm.value.UsPassword +
        '       ver password = ' +
        this.signupForm.value.verPassword
      );
      console.log('\n\ndoing get runnofl');

      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runstaffno += 1;
        data = this.runnodet[0];
        datainp.UsStaffcd = 'STF' + this.runnodet[0].runstaffno;

        console.log('\n\ndata = ' + JSON.stringify(this.runnodet[0]._id));

        this.arcctvService.idfld = this.runnodet[0].runno;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            //window.location.reload;
          }, // at next data
        }); //updat4eitem

        console.log(
          '/n/nstaffdetinp = ' + JSON.stringify(datainp) + '\n\n'
        );
        this.AuthService.authfldb = 'Staffdb';
        this.AuthService.signup(datainp).subscribe({
          next: (data) => {
            this.toast.success(
              'Record created successfully... your client Code  is ' + datainp.UsStaffcd,
              'Signup success',
              {
                timeOut: 1500,

              }
            );

            this.sendemail(datainp)

            this.reset('A')
            this.wssmode = 'Add';
            this.router.navigate(['signup'], { queryParams: { wssmode: 'Add' } });

            //  window.location.reload();
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Signup Error', {
              timeOut: 1500,
            });
          },
        });
      });
    } else {

      this.AuthService.authfldb = 'Staffdb';
      this.staffdetail.UsStaffcd = datainp.UsStaffcd;
      //   this.staffdetail.Uslevel = datainp.Uslevel;
      this.staffdetail.UsStaffname = datainp.UsStaffname;
      this.staffdetail.UsStaffAddress = datainp.UsStaffAddress;
      this.staffdetail.UsHphone = datainp.UsHphone;
      this.staffdetail.Usemail = datainp.Usemail;

      console.log("\n\nthis.staffdetail = " + JSON.stringify(this.staffdetail))

      this.AuthService.updatestaff(this.staffdetail, "A").subscribe({
        next: (data) => {
          this.toast.success(
            'Record updated successfully...',
            'Signup success',
            {
              timeOut: 1500,

            })

          //   window.location.reload();

          this.wssmode = 'Maintenance';
          this.router.navigate(['signup'], { queryParams: { wssmode: 'Maintenance' } });


        }, // at next data

        error: (res) => {
          this.toast.error(res.error.message);
        },
      });

    }
  }

  async updateclient(cldatainp: Clientdb) {

    //Add Staff
    if (cldatainp.clcode == null) {
      cldatainp.resetPasswordToken = null;
      cldatainp.resetPasswordExpires = null;
      cldatainp.clandtoken = null;

      cldatainp.clpassword = this.clientForm.value.clpassword;
      console.log(
        '\n\nstaffdetinp = ' +
        JSON.stringify(cldatainp) +
        '    password = ' +
        this.clientForm.value.clpassword +
        '       ver password = ' +
        this.clientForm.value.verpassword
      );
      console.log('\n\ndoing get runnofl');

      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runclno += 1;
        data = this.runnodet[0];
        cldatainp.clcode = 'CLI' + this.runnodet[0].runclno;

        console.log('\n\ndata = ' + JSON.stringify(this.runnodet[0]._id));
        this.arcctvService.idfld = cldatainp.clcode;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            //window.location.reload;
          }, // at next data
        }); //updat4eitem

        console.log(
          '/n/nstaffdetinp = ' + JSON.stringify(cldatainp) + '\n\n'
        );
        this.AuthService.authfldb = 'clientdb';
        this.AuthService.signup(cldatainp).subscribe({
          next: (data) => {
            this.toast.success(
              'Record ' + cldatainp.clcode + ' created successfully',
              'Signup success',
              {
                timeOut: 1500,

              }
            );

            this.sendemail(cldatainp)

            this.reset('C')
            this.wssmode = 'Add';
            this.router.navigate(['/home']);

            //  window.location.reload();
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Signup Error', {
              timeOut: 1500,
            });
          },
        });
      });
    }

  }
  sendemail(signdata: any) {

    if (this.signuptype == 'C') {
      var stext = '<h1>Hi,' + signdata.clname + '</h1>'
      stext = stext + '<h4>Thanks for joining us</h4>'
      stext = stext + '<br> '
      //  stext = stext + '<p>Your userid : ' + signdata.clcode + '<br>'
      // if (signdata.//cltype != '0') {
      //   stext = stext + '<p>Your Chapter : ' + signdata.clcode + '<br>'
      stext = stext + '<p>Your userid : ' + signdata.clcode + '</p>'
      // };
      stext = stext + '<p> password = ' + signdata.clpassword + '</p>'
      stext = stext + '<br><br> from staf odf 20A Kampong Siglap'
    } else {
      var stext = '<h1>Hi,' + signdata.UsStaffname + '</h1>'
      stext = stext + '<h4>Thank you for joining us</h4>'
      stext = stext + '<br> '
      stext = stext + '<p>Your userid : ' + signdata.UsStaffcd + '<br>'
      // if (signdata.//cltype != '0') {
      //   stext = stext + '<p>Your Chapter : ' + signdata.clcode + '<br>'
      //  stext = stext + '<p>Your userid : ' + signdata.clcode + '</p>'
      // };
      stext = stext + '<p> password = ' + signdata.UsPassword + '</p>'
      stext = stext + '<br><br> from staf odf ARcctv System'

    }

    this.arcctvService.mailOptions = {
      from: '"AR cctc System"<arsubahan.gmail.com>', // sender address
      to: "arsubahan@yahoo.com", // list of receivers
      subject: "Welcome to AR cctv  Website.", // Subject line
      html: stext
    }

    this.arcctvService.mailsub(signdata).subscribe({
      next: (data) => {
        this.toast.success('Record updated successfully');

        this.wssmode = 'Maintenance';
        this.router.navigate(['signup'], { queryParams: { wssmode: 'Maintenance' } });


      }, // at next data

      error: (res) => {
        this.toast.error(res.error.message);
      },
    });
  }

  cancelcmd() {
    if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      this.wssmode = 'Maintenance';
      this.router.navigate(['signup'], { queryParams: { wssmode: 'Maintenance' } });
    } else if (this.wssmode == 'Add') {
      this.location.back();;
    }
  }

  delecmd(staffdetinp: Staffdb) {
    if (confirm('Are you sure you want to delete Staff ' + staffdetinp.UsStaffname + '?')) {
      // Save it!
      // console.log('Thing was saved to the database.');
      var staffcd = staffdetinp.UsStaffcd;
      this.arcctvService.idfld = staffdetinp.UsStaffcd;
      this.arcctvService.deleteitem(staffdetinp).subscribe((data) => {
        this.staffdet = this.staffdet.filter(
          (item) => item.UsStaffcd != staffcd
        );
        this.arcctvService.fetchAllrecord().subscribe((data) => {
          this.staffdet = data;
          this.dataSource = new MatTableDataSource<Staffdb>(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });

        this.toast.success(
          'Record ' + staffcd + ' Deleted successfully',
          'Signup Success',
          {
            timeOut: 1000,
          }
        );
        //  window.location.reload
        //   this.wssmode = "Maintenance"
        this.router.navigate(['/signup'], { queryParams: { wssmode: 'Maintenance' } })
      });
    } else {
      // Do nothing!
      //  console.log('Thing was not saved to the database.');
    }
  }
}