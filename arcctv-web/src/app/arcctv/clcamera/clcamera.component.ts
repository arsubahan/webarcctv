import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule, Location } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ArcctvService } from './../arcctv.service';
import { AuthService } from './../auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { Locationdb, Videodb, Vidtypedb } from './../dbinterface';


@Component({
  selector: 'app-clcamera',
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
  templateUrl: './clcamera.component.html',
  styleUrl: './clcamera.component.css'
})
export class ClcameraComponent  implements OnInit {
  router = inject(Router);
  location = inject(Location);

  verpassword = '';
  wssmode = 'Add';
  clcameraForm: FormGroup;
  clcameratmodForm: FormGroup;
  runnodet = {};
  wss_id;
  txtclname = '';
  txtcamno = 0;

  Cctvtypedetail: Vidtypedb = {
    cctvtypecode: '',
    cctvtypedesc: ''
  };
  Cctvtypedet: Vidtypedb[] = [];

  locdetail: Locationdb = {
    loccode: '',
    locdesc: ''
  };
  locdet: Locationdb[] = [];

  Videodetail: Videodb = {
    vidclcode: '',
    vidcltype: '',
    vidip: '',
    vidloc: '',
    vidlocpub: '',
    vidwsport: '',
    viduserid: '',
    vidpassword: '',
    vidcamno: 0
  };
  Videodet: Videodb[] = [];


  picdisplayedColumns: string[] = [
    'vidcamno',
    'vidcltype',
    'vidip',
    'vidloc',
    'vidlocpub',
    'Edit',
    'Delete'
  ];

  viddataSource = new MatTableDataSource<Videodb>();

  @ViewChild(MatPaginator) paginator: any;

  clID: any;


  constructor(
    private AuthService: AuthService,
    private arcctvService: ArcctvService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {

    if (this.AuthService.getIsAuthenticated) {
      this.route.queryParams.subscribe((queryParams) => {
        // this.wssmode = queryParams['wssmode'];
        this.clID = queryParams['clID'];
        //  this.AuthService.isStart = queryParams['wsstart']
        this.clID = sessionStorage.getItem('staffid') || '';
        this.txtclname = sessionStorage.getItem('Staffname') || '';
      });

      console.log('wssmode:', this.wssmode);
      console.log('clID:', this.clID);


      // Fetch CCTV type details
      this.arcctvService.fldb = 'vidtypedb';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.Cctvtypedet = data;


        //   console.log("\n\n  this.chaptlupdet = " + JSON.stringify(this.chaptlupdet))
      })

      // Fetch loction details
      this.arcctvService.fldb = 'locationdb';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.locdet = data;
        //   console.log("\n\n  this.chaptlupdet = " + JSON.stringify(this.chaptlupdet))
      })



      //  console.log("\n\nthis.Cctvtypedetail = " + JSON.stringify(this.Cctvtypedetail));

      this.arcctvService.fldb = 'clvideodb';
      //var test = { evntgalcd: this.eventcd };
      this.arcctvService.varsrch = { vidclcode: this.clID };
      this.arcctvService.fetchcrit().subscribe({
        next: async (data) => {
          this.Videodet = data;
          this.viddataSource.data = data;
          this.txtcamno = await Number(this.Videodet.length) + 1;
          this.viddataSource.paginator = this.paginator;
          //   this.Videodetail = data;

          //         console.log("\n\n this.Videodetail = " + this.Videodet.length + "     txtcamno = " + this.txtcamno);

        },
        error: (err) => {
          console.error('Error fetching count:', err);

        }
      });
      // this.txtcamno = Number(this.Videodet.length) + 1;

      //   console.log("\n\n this.Videodetail = " + this.Videodet.length + "     txtcamno = " + this.txtcamno);


      this.clcameraForm = new FormGroup({
        vidclcode: new FormControl(this.clID),
        vidcltype: new FormControl('', Validators.required),
        vidip: new FormControl('', Validators.required),
        vidloc: new FormControl('', Validators.required),
        vidlocpub: new FormControl('', Validators.required),
        vidwsport: new FormControl(''),
        viduserid: new FormControl('', Validators.required),
        vidpassword: new FormControl('', Validators.required),
        vidcamno: new FormControl(""),
      });
    }
  }

  populate(Videodetinp) {
    this.clcameraForm.setValue({
      vidclcode: Videodetinp.vidclcode,
      vidcltype: Videodetinp.vidcltype,
      vidip: Videodetinp.vidip,
      vidloc: Videodetinp.vidloc,
      vidlocpub: Videodetinp.vidlocpub,
      vidwsport: Videodetinp.vidwsport,
      viduserid: Videodetinp.viduserid,
      vidpassword: Videodetinp.vidpassword,
      vidcamno: Videodetinp.vidcamno
    });

    this.Videodetail = Videodetinp;

  }

  sendemail(videodata: any) {
    var stext = '<h1>Hi,' + videodata.UsStaffname + '</h1>'
    stext = stext + '<h4>Thank you for joining us</h4>'
    stext = stext + '<br> '
    stext = stext + '<p>Your userid : ' + videodata.UsStaffcd + '<br>'
    // if (videodata.//cltype != '0') {
    //   stext = stext + '<p>Your Chapter : ' + videodata.clcode + '<br>'
    //  stext = stext + '<p>Your userid : ' + videodata.clcode + '</p>'
    // };
    stext = stext + '<p> password = ' + videodata.UsPassword + '</p>'
    stext = stext + '<br><br> from staf odf ARcctv System'



    this.arcctvService.mailOptions = {
      from: '"AR cctc System"<arsubahan.gmail.com>', // sender address
      to: "arsubahan@yahoo.com", // list of receivers
      subject: "Welcome to AR cctv  Website.", // Subject line
      html: stext
    }

    this.arcctvService.mailsub(videodata).subscribe({
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

  reset() {
    this.arcctvService.varsrch = { vidclcode: this.clID };
    this.arcctvService.fetchcrit().subscribe({
      next: async (data) => {
        this.Videodet = data;
        this.viddataSource.data = data;
        this.txtcamno = await Number(this.Videodet.length) + 1;
        this.viddataSource.paginator = this.paginator;
        //   this.Videodetail = data;

        //         console.log("\n\n this.Videodetail = " + this.Videodet.length + "     txtcamno = " + this.txtcamno);

      },
      error: (err) => {
        console.error('Error fetching count:', err);

      }
    })

    this.clcameraForm.setValue({
      vidclcode: this.clID,
      vidcltype: '',
      vidip: '',
      vidloc: '',
      vidlocpub: '',
      vidwsport: '',
      viduserid: '',
      vidpassword: '',
      vidcamno: Number(this.Videodet.length) + 1
    })
    this.wssmode = "Add"


  }

  updaterec(datainp: Videodb) {
    this.AuthService.authfldb = 'clvideodb';

    if (this.wssmode == "Add") {

      datainp.vidcamno = this.txtcamno

      /*========================================
      ***  Get runwsport from ruunofl port  ****
      =========================================*/
      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runwsport += 100;
        data = this.runnodet[0];

        datainp.vidwsport = this.runnodet[0].runwsport.toString();
        console.log('\n\ndata - rubnno = ' + JSON.stringify(this.runnodet[0]));
        this.arcctvService.idfld = datainp.vidwsport;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            // window.location.reload;
          }, // at next data
        }); //updat4eitem

        // end dof get port from runno fl

        datainp.vidwsport = String(4000 + Number(datainp.vidcamno) * 100)

        console.log("this.datainp = " + JSON.stringify(datainp))

        this.arcctvService.fldb = 'clvideodb';
        this.arcctvService.createitem(datainp).subscribe({
          next: (data) => {
            this.toast.success('Record created successfully', 'Register Camera " + datainp.vidcamno +  Form', {
              timeOut: 2500,
            });
            this.reset();
            this.wssmode = 'Add';
            this.router.navigate(['clcamera'], {
              queryParams: { wssmode: 'Add' },
            });
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Video Form', {
              timeOut: 1500,
            });
          },
        });
      });

    } else {
      this.arcctvService.fldb = 'clvideodb';
      this.arcctvService.idfld = datainp.vidclcode;
      this.Videodetail.vidclcode = datainp.vidclcode;
      this.Videodetail.vidcltype = datainp.vidcltype,
        this.Videodetail.vidip = datainp.vidip,
        this.Videodetail.vidloc = datainp.vidloc,
        this.Videodetail.vidlocpub = datainp.vidlocpub,
        this.Videodetail.vidwsport = datainp.vidwsport,
        this.Videodetail.viduserid = datainp.viduserid,
        this.Videodetail.vidpassword = datainp.vidpassword

      this.arcctvService.updateitem(this.Videodetail).subscribe({
        next: async (data) => {
          this.toast.success(
            'Record updated successfully... ',
            'update camera ',
            {
              timeOut: 1500,
            }
          );

          this.sendemail(datainp)

          this.reset()
          this.wssmode = 'Add';
          //     this.router.navigate(['c'], { queryParams: { wssmode: 'Add' } });

          //  window.location.reload();
        }, // at next data

        error: (res) => {
          this.toast.error(res.error.message, 'update camera Error', {
            timeOut: 1500,
          });
        },
      });


      //   console.log('\n\nmaintain submit' + JSON.stringify(datainp));
    }



  }

  editcmd(Videodetinp) {
    this.populate(Videodetinp);
    this.wssmode = 'edit';
    //console.log("\n\n this.Videodetail = " + JSON.stringify(this.Videodetail));
  }


  deletecmd(Videodetinp) {
    if (
      confirm(
        'Are you sure you want to delete Location ' + Videodetinp.vidclcode + '?'
      )
    ) {
      // Save it!
      // console.log('Thing was saved to the database.');
      // var Chaptcd = Videodetinp.loccode;
      this.arcctvService.varsrch = { vidclcode: Videodetinp.vidclcode, vidcamno: Number(Videodetinp.vidcamno) };
    }
    this.arcctvService.fldb = 'clvideodb';
    this.arcctvService.idfld = Videodetinp.vidclcode;
    this.arcctvService.delcrit(Videodetinp).subscribe((data) => {
      this.Videodet = this.Videodet.filter((item) => item.vidclcode != Videodetinp.vidclcode || item.vidcamno != Videodetinp.vidcamno);
      this.toast.success(
        'Record ' + Videodetinp.vidclcode + ' and  camno ' + Videodetinp.vidcamno + ' Deleted successfully',
        'Video Form',
        {
          timeOut: 1500,
        }

      );
      this.reset()

    });

    //  this.wssmode = 'Maintenance'
    // this.router.navigate(['/Locationdb'], { queryParams: { wssmode: 'Maintenance' } })
    // });
    // } else {
    // Do nothing!
    //  console.log('Thing was not saved to the database.');
    // }
  }

  // }

  cancelcmd() {
    // this.location.back();
    this.reset()
  }


} // end class
