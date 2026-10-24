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
import { ArcctvService } from './../../arcctv.service';
import { AuthService } from '../../auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import {  Vidtypedb } from '../../dbinterface';


@Component({
  selector: 'app-videotype',
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
  templateUrl: './videotype.component.html',
  styleUrl: './videotype.component.css'
})
export class VideotypeComponent  implements OnInit {
  router = inject(Router);
  location = inject(Location);

  verpassword = '';
  wssmode = '';
  VidtyForm: FormGroup;
  VidtymodForm: FormGroup;
  runnodet = {};
  wss_id;

  Vidtydetail: Vidtypedb = {
   cctvtypecode: '',
    cctvtypedesc: '',
    
  };
  Vidtydet: Vidtypedb[] = [];
  filteredLocdet: Vidtypedb[] = [];

  displayedColumns: string[] = [
    'cctvtypecode',
    'cctvtypedesc',
    'Edit',
    'Delete',
  ];
  dataSource = new MatTableDataSource<Vidtypedb>();

  @ViewChild('cctvtypecode')cctvtypecode: any = '';
  @ViewChild('cctvtypedesc') cctvtypedesc: any = '';

  @ViewChild(MatSort) sort: any;
  @ViewChild(MatPaginator) paginator: any;

  constructor(
    private AuthService: AuthService,
    private arcctvService: ArcctvService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.AuthService.getIsAuthenticated) {
      this.route.queryParams.subscribe((queryParams) => {
        this.wssmode = queryParams['wssmode'];
      });

      if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      }

      this.VidtyForm = new FormGroup(
        {
         cctvtypecode: new FormControl(null),
          cctvtypedesc: new FormControl(null, Validators.required),
         },
      );

      this.VidtymodForm = new FormGroup({
       cctvtypecode: new FormControl(null),
        cctvtypedesc: new FormControl(null),
      });
    } else {
      this.toast.error('please login', 'autentication', {
        timeOut: 1500,
      });
    }
    if (this.wssmode == 'Maintenance') {
      this.arcctvService.fldb = 'vidtypedb';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.Vidtydet = data;
        this.dataSource = new MatTableDataSource<Vidtypedb>(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    } else if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      console.log('\n\nmod thisChaptdet = ' + JSON.stringify(this.Vidtydetail));
    }

    //end for OnInit
  } //end for export

  populate(Vidtydet: Vidtypedb) {
    this.wssmode = 'Modify';
    this.VidtyForm.setValue({
     cctvtypecode: Vidtydet.cctvtypecode,
      cctvtypedesc: Vidtydet.cctvtypedesc,
    });

    this.Vidtydetail = Vidtydet;

    // console.log(
    //   '\n\n this.VidtyForm = ' + JSON.stringify(this.VidtyForm.value)
    // );
  }

  searchFilter() {
    this.filteredLocdet = [];
    let filterObject: any = {
     cctvtypecode: this.cctvtypecode.nativeElement.value,
      cctvtypedesc: this.cctvtypedesc.nativeElement.value,
    };
    for (let i = 0; i < this.Vidtydet.length; i++) {
      let isStringExist;
      for (let key in filterObject) {
        // console.log("\n\nthis.Vidtydet[" + i +"][" + key + "] = " + this.Vidtydet[i][key] + "    filter obj = " +  JSON.stringify(filterObject))

        if (key == 'stfcd') {
          isStringExist =
            this.Vidtydet[i][key].toString().indexOf(filterObject[key]) > -1;
        } else {
          if (this.Vidtydet[i][key]) {
            isStringExist =
              this.Vidtydet[i][key]
                .toUpperCase()
                .indexOf(filterObject[key].toUpperCase()) > -1;
          } else if (!this.Vidtydet[i][key] && filterObject[key] !== '') {
            isStringExist = false;
          }
        }
        if (isStringExist == false) {
          break;
        }
      }
      if (isStringExist) {
        this.filteredLocdet.push(this.Vidtydet[i]);
      }
    }
    this.dataSource = new MatTableDataSource<Vidtypedb>(this.filteredLocdet);
     this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
   }

  addupdate(vidtypedetinp: Vidtypedb) {
    //AddChapt
    if (vidtypedetinp.cctvtypecode == null) {
       console.log('\n\ndoing get runnofl');

      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runvidno += 1;
        data = this.runnodet[0];

        vidtypedetinp.cctvtypecode = 'VIDTYPE' + this.runnodet[0].runvidno.toString();
        console.log('\n\ndata - rubnno = ' + JSON.stringify(this.runnodet[0]));
        this.arcctvService.idfld = vidtypedetinp.cctvtypecode;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            // window.location.reload;
          }, // at next data
        }); //updat4eitem

        console.log(
          '/n/nvidtypedetinp = ' + JSON.stringify(vidtypedetinp) + '\n\n'
        );
        this.arcctvService.fldb = 'vidtypedb';
        this.arcctvService.createitem(vidtypedetinp).subscribe({
          next: (data) => {
            this.toast.success('Record created successfully', 'Vodeo Type Form', {
              timeOut: 1500,
            });
            this.reset();
            this.wssmode = 'Add';
            this.router.navigate(['videotype'], {
              queryParams: { wssmode: 'Add' },
            });
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Video Type Form', {
              timeOut: 1500,
            });
          },
        });
      });
    } else {
      this.arcctvService.fldb = 'vidtypedb';
      this.arcctvService.idfld = vidtypedetinp.cctvtypecode;
      this.Vidtydetail.cctvtypecode = vidtypedetinp.cctvtypecode;
      this.Vidtydetail.cctvtypedesc = vidtypedetinp.cctvtypedesc;
       this.arcctvService.updateitem(this.Vidtydetail).subscribe({
        next: (data) => {
          this.toast.success('Record updated successfully', 'Video Type Form', {
            timeOut: 1500,
          });
          this.wssmode = 'Maintenance';
          this.router.navigate(['/videotype'], {
            queryParams: { wssmode: 'Maintenance' },
          });
        }, // at next data

        error: (res) => {
          this.toast.error(res.error.message, 'Video Type Form', {
            timeOut: 1500,
          });
        },
      });

      //   console.log('\n\nmaintain submit' + JSON.stringify(vidtypedetinp));
    }
  }

  cancelcmd() {
    if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      this.wssmode = 'Maintenance';
      this.router.navigate(['videotype'], {
        queryParams: { wssmode: 'Maintenance' },
      });
    } else if (this.wssmode == 'Add') {
      this.location.back();
    }
  }

  reset() {
    this.VidtyForm.setValue({
     cctvtypecode: '',
      cctvtypedesc: '',

    });
  }

  delecmd(vidtypedetinp: Vidtypedb) {
    if (
      confirm(
        'Are you sure you want to delete Location ' + vidtypedetinp.cctvtypedesc + '?'
      )
    ) {
      // Save it!
      // console.log('Thing was saved to the database.');
      var Chaptcd = vidtypedetinp.cctvtypecode;
      this.arcctvService.idfld = vidtypedetinp.cctvtypedesc;
      this.arcctvService.deleteitem(vidtypedetinp).subscribe((data) => {
        this.Vidtydet = this.Vidtydet.filter((item) => item.cctvtypecode != Chaptcd);
        this.toast.success(
          'Record ' + Chaptcd + ' Deleted successfully',
          'Location Form',
          {
            timeOut: 1500,
          }
        );
        this.arcctvService.fldb = 'vidtypedb';
        this.arcctvService.fetchAllrecord().subscribe((data) => {
          this.Vidtydet = data;
          this.dataSource = new MatTableDataSource<Vidtypedb>(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
        //  this.wssmode = 'Maintenance'
        // this.router.navigate(['/Vidtypedb'], { queryParams: { wssmode: 'Maintenance' } })
      });
    } else {
      // Do nothing!
      //  console.log('Thing was not saved to the database.');
    }
  }
}