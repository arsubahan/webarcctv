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

import { ArcctvService } from './../arcctv.service';
import { AuthService, clmatchpassword, matchpassword } from './../auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Clientdb, Staffdb } from './../dbinterface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clprofile',
  standalone: true,
imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
       MatSortModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './clprofile.component.html',
  styleUrl: './clprofile.component.css'
})
export class ClprofileComponent  implements OnInit {

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
  clID = '';

  clientdetail: Clientdb = {
    clcode: '',
    cltype: '',
    clname: '',
    claddress: '',
    clcontactno: '',
    clemail: '',
    cldatereg: '',
    clpassword: '',
    clandtoken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,

  }
  clientdet: Clientdb[] = []

  constructor(
    private AuthService: AuthService,
    private arcctvService: ArcctvService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }


  ngOnInit(): void {
    if (this.AuthService.getIsAuthenticated) {
      this.route.queryParams.subscribe((queryParams) => {
        this.wssmode = queryParams['wssmode'];
        this.clID = queryParams['clID'];
        //  this.AuthService.isStart = queryParams['wsstart']
      });

      this.clientForm = new FormGroup(
        {
          clcode: new FormControl(null),
          cltype: new FormControl('C'),
          clname: new FormControl(null, Validators.required),
          claddress: new FormControl(null, Validators.required),
          clcontactno: new FormControl(null, Validators.required),
          clemail: new FormControl(null, [Validators.required, Validators.email]),
          cldatereg: new FormControl(formatDate(new Date(), 'dd MMMM yyyy', 'en-US'), Validators.required),
          clpassword: new FormControl(null, Validators.required),
          //  verpassword: new FormControl(null),
        })
      // }, clmatchpassword('clpassword', 'verpassword'));

      if (sessionStorage.getItem("staffid") == this.clID) {
        // this.toast.error('Unauthorized Access to Client Profile');
        //  this.router.navigate(['/clhome'], { queryParams: { clID: this.clID } });
        this.arcctvService.fldb = 'clientdb';
        //var test = { evntgalcd: this.eventcd };
        this.arcctvService.varsrch = { clcode: this.clID };
        this.arcctvService.fetchcrit().subscribe(async (data) => {
          this.clientdetail = data[0];
          console.log("\n\nthis.clientdetail = " + JSON.stringify(this.clientdetail.cltype));

          this.clientForm.setValue({
            clcode: this.clientdetail.clcode,
            cltype: this.clientdetail.cltype,
            clname: this.clientdetail.clname,
            claddress: this.clientdetail.claddress,
            clcontactno: this.clientdetail.clcontactno,
            clemail: this.clientdetail.clemail,
            cldatereg: this.clientdetail.cldatereg,
            clpassword: this.clientdetail.clpassword,
            // verpassword: this.clientdetail.clpassword,
          });

        })
      }

    }
  }


  async updateclient(cldatainp: Clientdb) {

    this.AuthService.authfldb = 'clientdb';
    this.clientdetail.clcode = cldatainp.clcode;
    this.clientdetail.clname = cldatainp.clname;
    this.clientdetail.cltype = cldatainp.cltype;
    this.clientdetail.claddress = cldatainp.claddress;
    this.clientdetail.clcontactno = cldatainp.clcontactno;
    this.clientdetail.clemail = cldatainp.clemail;



    console.log('\n\nmaintain submit' + JSON.stringify(this.clientdetail));

    this.AuthService.updatestaff(this.clientdetail, "C").subscribe({
      next: (data) => {
        this.toast.success(
          'Record ' + cldatainp.clcode + ' Updated successfully',
          'Signup Success',
          {
            timeOut: 1000,
          })

        //   window.location.reload();

        //  this.wssmode = 'Maintenance';
        //    this.router.navigate(['clhome'], { queryParams: { wssmode: 'Maintenance' } });


      }, // at next data

      error: (res) => {
        this.toast.error(res.error.message);
      },
    });


  }

  sendemail(signdata: any) {

    // if (this.signuptype == 'C') {
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
    /* }  else {
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
 */
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
        // this.router.navigate(['signup'], { queryParams: { wssmode: 'Maintenance' } });


      }, // at next data

      error: (res) => {
        this.toast.error(res.error.message);
      },
    });
  }


  cancelcmd() {
    // if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
    //   this.wssmode = 'Maintenance';
    //   this.router.navigate(['/clhome'], { queryParams: {clID: this.clID } });
    // } else if (this.wssmode == 'Add') {
    this.location.back();;
    // }
  }

  delecmd(clientdetinp: Clientdb) {
    if (confirm('Are you sure you want to delete Staff ' + clientdetinp.clname + '?')) {
      // Save it!
      // console.log('Thing was saved to the database.');
      var staffcd = clientdetinp.clcode;
      this.arcctvService.idfld = clientdetinp.clcode;
      this.arcctvService.deleteitem(clientdetinp).subscribe((data) => {
        this.clientdet = this.clientdet.filter(
          (item) => item.clcode != staffcd
        );
        // this.arcctvService.fetchAllrecord().subscribe((data) => {
        //   this.clientdet = data;
        //   this.dataSource = new MatTableDataSource<Clientdb>(data);
        //   this.dataSource.sort = this.sort;
        //   this.dataSource.paginator = this.paginator;
        // });

        this.toast.success(
          'Record ' + staffcd + ' Deleted successfully',
          'Signup Success',
          {
            timeOut: 1000,
          }
        );
        //  window.location.reload
        //   this.wssmode = "Maintenance"
        //  this.router.navigate(['/signup'], { queryParams: { wssmode: 'Maintenance' } })
      });
    } else {
      // Do nothing!
      //  console.log('Thing was not saved to the database.');
    }
  }

}
