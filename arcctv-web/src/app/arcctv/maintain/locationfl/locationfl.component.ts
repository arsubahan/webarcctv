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
import { AuthService} from '../../auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { Locationdb } from '../../dbinterface';



@Component({
  selector: 'app-locationfl',
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
  templateUrl: './locationfl.component.html',
  styleUrl: './locationfl.component.css'
})
export class LocationflComponent implements OnInit {
  router = inject(Router);
  location = inject(Location);

  verpassword = '';
  wssmode = '';
  LocForm: FormGroup;
  LocmodForm: FormGroup;
  runnodet = {};
  wss_id;

  Locdetail: Locationdb = {
    loccode: '',
    locdesc: '',
    
  };
  Locdet: Locationdb[] = [];
  filteredLocdet: Locationdb[] = [];

  displayedColumns: string[] = [
    'loccode',
    'locdesc',
    'Edit',
    'Delete',
  ];
  dataSource = new MatTableDataSource<Locationdb>();

  @ViewChild('loccode') loccode: any = '';
  @ViewChild('locdesc') locdesc: any = '';

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

      this.LocForm = new FormGroup(
        {
          loccode: new FormControl(null),
          locdesc: new FormControl(null, Validators.required),
         },
      );

      this.LocmodForm = new FormGroup({
        loccode: new FormControl(null),
        locdesc: new FormControl(null),
      });
    } else {
      this.toast.error('please login', 'autentication', {
        timeOut: 1500,
      });
    }
    if (this.wssmode == 'Maintenance') {
      this.arcctvService.fldb = 'locationdb';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.Locdet = data;
        this.dataSource = new MatTableDataSource<Locationdb>(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    } else if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      console.log('\n\nmod thisChaptdet = ' + JSON.stringify(this.Locdetail));
    }

    //end for OnInit
  } //end for export

  populate(Locdet: Locationdb) {
    this.wssmode = 'Modify';
    this.LocForm.setValue({
      loccode: Locdet.loccode,
      locdesc: Locdet.locdesc,
    });

    this.Locdetail = Locdet;

    // console.log(
    //   '\n\n this.LocForm = ' + JSON.stringify(this.LocForm.value)
    // );
  }

  searchFilter() {
    this.filteredLocdet = [];
    let filterObject: any = {
      loccode: this.loccode.nativeElement.value,
      locdesc: this.locdesc.nativeElement.value,
    };
    for (let i = 0; i < this.Locdet.length; i++) {
      let isStringExist;
      for (let key in filterObject) {
        // console.log("\n\nthis.Locdet[" + i +"][" + key + "] = " + this.Locdet[i][key] + "    filter obj = " +  JSON.stringify(filterObject))

        if (key == 'stfcd') {
          isStringExist =
            this.Locdet[i][key].toString().indexOf(filterObject[key]) > -1;
        } else {
          if (this.Locdet[i][key]) {
            isStringExist =
              this.Locdet[i][key]
                .toUpperCase()
                .indexOf(filterObject[key].toUpperCase()) > -1;
          } else if (!this.Locdet[i][key] && filterObject[key] !== '') {
            isStringExist = false;
          }
        }
        if (isStringExist == false) {
          break;
        }
      }
      if (isStringExist) {
        this.filteredLocdet.push(this.Locdet[i]);
      }
    }
    this.dataSource = new MatTableDataSource<Locationdb>(this.filteredLocdet);
     this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
   }

  addupdate(Locdetinp: Locationdb) {
    //AddChapt
    if (Locdetinp.loccode == null) {
       console.log('\n\ndoing get runnofl');

      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runlocno += 1;
        data = this.runnodet[0];

        Locdetinp.loccode = 'LOC' + this.runnodet[0].runlocno.toString();
        console.log('\n\ndata - rubnno = ' + JSON.stringify(this.runnodet[0]));
        this.arcctvService.idfld = Locdetinp.loccode;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            // window.location.reload;
          }, // at next data
        }); //updat4eitem

        console.log(
          '/n/nLocdetinp = ' + JSON.stringify(Locdetinp) + '\n\n'
        );
        this.arcctvService.fldb = 'locationdb';
        this.arcctvService.createitem(Locdetinp).subscribe({
          next: (data) => {
            this.toast.success('Record created successfully', 'Location Form', {
              timeOut: 1500,
            });
            this.reset();
            this.wssmode = 'Add';
            this.router.navigate(['locationfl'], {
              queryParams: { wssmode: 'Add' },
            });
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'Location Form', {
              timeOut: 1500,
            });
          },
        });
      });
    } else {
      this.arcctvService.fldb = 'locationdb';
      this.arcctvService.idfld = Locdetinp.loccode;
      this.Locdetail.loccode = Locdetinp.loccode;
      this.Locdetail.locdesc = Locdetinp.locdesc;
       this.arcctvService.updateitem(this.Locdetail).subscribe({
        next: (data) => {
          this.toast.success('Record updated successfully', 'Location Form', {
            timeOut: 1500,
          });
          this.wssmode = 'Maintenance';
          this.router.navigate(['/locationfl'], {
            queryParams: { wssmode: 'Maintenance' },
          });
        }, // at next data

        error: (res) => {
          this.toast.error(res.error.message, 'Location Form', {
            timeOut: 1500,
          });
        },
      });

      //   console.log('\n\nmaintain submit' + JSON.stringify(Locdetinp));
    }
  }

  cancelcmd() {
    if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      this.wssmode = 'Maintenance';
      this.router.navigate(['locationfl'], {
        queryParams: { wssmode: 'Maintenance' },
      });
    } else if (this.wssmode == 'Add') {
      this.location.back();
    }
  }

  reset() {
    this.LocForm.setValue({
      loccode: '',
      locdesc: '',

    });
  }

  delecmd(Locdetinp: Locationdb) {
    if (
      confirm(
        'Are you sure you want to delete Location ' + Locdetinp.locdesc + '?'
      )
    ) {
      // Save it!
      // console.log('Thing was saved to the database.');
      var Chaptcd = Locdetinp.loccode;
      this.arcctvService.idfld = Locdetinp.locdesc;
      this.arcctvService.deleteitem(Locdetinp).subscribe((data) => {
        this.Locdet = this.Locdet.filter((item) => item.loccode != Chaptcd);
        this.toast.success(
          'Record ' + Chaptcd + ' Deleted successfully',
          'Location Form',
          {
            timeOut: 1500,
          }
        );
        this.arcctvService.fldb = 'locationdb';
        this.arcctvService.fetchAllrecord().subscribe((data) => {
          this.Locdet = data;
          this.dataSource = new MatTableDataSource<Locationdb>(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
        //  this.wssmode = 'Maintenance'
        // this.router.navigate(['/Locationdb'], { queryParams: { wssmode: 'Maintenance' } })
      });
    } else {
      // Do nothing!
      //  console.log('Thing was not saved to the database.');
    }
  }
}