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
import { configdb } from '../../dbinterface';

@Component({
  selector: 'app-config',
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
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class configComponent implements OnInit {
  router = inject(Router);
  location = inject(Location);

  verpassword = '';
  wssmode = '';
  configForm: FormGroup;
  configmodForm: FormGroup;
  runnodet = {};
  wss_id;

  configdetail: configdb = {
    configcode: '',
    configdesc: '',
    configvalue: ''
  };
  configdet: configdb[] = [];
  filteredconfigdet: configdb[] = [];

  displayedColumns: string[] = [
    'configcode',
    'configdesc',
    'configvalue',
    'Edit',
    'Delete',
  ];
  dataSource = new MatTableDataSource<configdb>();

  @ViewChild('configcode') configcode: any = '';
  @ViewChild('configdesc') configdesc: any = '';
  @ViewChild('configvalue') configvalue: any = '';
 
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

      this.configForm = new FormGroup(
        {
          configcode: new FormControl(null),
          configdesc: new FormControl(null, Validators.required),
          configvalue: new FormControl(null, Validators.required),
         },
      );

      this.configmodForm = new FormGroup({
        configcode: new FormControl(null),
        configdesc: new FormControl(null),
        configvalue: new FormControl(null),
      });
    } else {
      this.toast.error('please login', 'autentication', {
        timeOut: 1500,
      });
    }
    if (this.wssmode == 'Maintenance') {
      this.arcctvService.fldb = 'configdb';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.configdet = data;
        this.dataSource = new MatTableDataSource<configdb>(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;


        console.log("\n\nthis.configdet = "  + JSON.stringify(data))
      });
    } else if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      console.log('\n\nmod thisChaptdet = ' + JSON.stringify(this.configdetail));
    }

    //end for OnInit
  } //end for export

  populate(configdet: configdb) {
    this.wssmode = 'Modify';
    this.configForm.setValue({
      configcode: configdet.configcode,
      configdesc: configdet.configdesc,
      configvalue: configdet.configvalue,
    });

    this.configdetail = configdet;

    //  console.log(
    //    '\n\n this.configForm = ' + JSON.stringify(configdet)
    //  );
  }

  searchFilter() {
    this.filteredconfigdet = [];
    let filterObject: any = {
      configcode: this.configcode.nativeElement.value,
      configdesc: this.configdesc.nativeElement.value,
      configvalue: this.configvalue.nativeElement.value,
    };
    for (let i = 0; i < this.configdet.length; i++) {
      let isStringExist;
      for (let key in filterObject) {
        // console.log("\n\nthis.configdet[" + i +"][" + key + "] = " + this.configdet[i][key] + "    filter obj = " +  JSON.stringify(filterObject))
  
        if (key == 'stfcd') {
          isStringExist =
            this.configdet[i][key].toString().indexOf(filterObject[key]) > -1;
        } else {
          if (this.configdet[i][key]) {
            isStringExist =
              this.configdet[i][key]
                .toUpperCase()
                .indexOf(filterObject[key].toUpperCase()) > -1;
          } else if (!this.configdet[i][key] && filterObject[key] !== '') {
            isStringExist = false;
          }
        }
        if (isStringExist == false) {
          break;
        }
      }
      if (isStringExist) {
        this.filteredconfigdet.push(this.configdet[i]);
      }
    }
    this.dataSource = new MatTableDataSource<configdb>(this.filteredconfigdet);
     this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
   }

  addupdate(configdetinp: configdb) {
    //AddChapt
    if (configdetinp.configcode == null) {
       console.log('\n\ndoing get runnofl');

      this.arcctvService.fldb = 'runnofl';
      this.arcctvService.fetchAllrecord().subscribe((data) => {
        this.runnodet = data;
        this.runnodet[0].runconfigno += 1;
        data = this.runnodet[0];

        configdetinp.configcode = 'config' + this.runnodet[0].runconfigno.toString();
        console.log('\n\ndata - rubnno = ' + JSON.stringify(this.runnodet[0]));
        this.arcctvService.idfld = configdetinp.configcode;
        this.arcctvService.updateitem(this.runnodet[0]).subscribe({
          next: (data) => {
            console.log('Record created successfully');
            // window.configation.reload;
          }, // at next data
        }); //updat4eitem

        console.log(
          '/n/nconfigdetinp = ' + JSON.stringify(configdetinp) + '\n\n'
        );
        this.arcctvService.fldb = 'configdb';
        this.arcctvService.createitem(configdetinp).subscribe({
          next: (data) => {
            this.toast.success('Record created successfully', 'configation Form', {
              timeOut: 1500,
            });
            this.reset();
            this.wssmode = 'Add';
            this.router.navigate(['config'], {
              queryParams: { wssmode: 'Add' },
            });
          }, // at next data

          error: (res) => {
            this.toast.error(res.error.message, 'configation Form', {
              timeOut: 1500,
            });
          },
        });
      });
    } else {
      this.arcctvService.fldb = 'configdb';
      this.arcctvService.idfld = configdetinp.configcode;
      this.configdetail.configcode = configdetinp.configcode;
      this.configdetail.configdesc = configdetinp.configdesc;
      this.configdetail.configvalue = configdetinp.configvalue;
       this.arcctvService.updateitem(this.configdetail).subscribe({
        next: (data) => {
          this.toast.success('Record updated successfully', 'configation Form', {
            timeOut: 1500,
          });
          this.wssmode = 'Maintenance';
          this.router.navigate(['/config'], {
            queryParams: { wssmode: 'Maintenance' },
          });
        }, // at next data

        error: (res) => {
          this.toast.error(res.error.message, 'configation Form', {
            timeOut: 1500,
          });
        },
      });

      //   console.log('\n\nmaintain submit' + JSON.stringify(configdetinp));
    }
  }

  cancelcmd() {
    if (this.wssmode == 'Modify' || this.wssmode == 'Delete') {
      this.wssmode = 'Maintenance';
      this.router.navigate(['/config'], {
        queryParams: { wssmode: 'Maintenance' },
      });
    } else if (this.wssmode == 'Add') {
      this.location.back();
    }
  }

  reset() {
    this.configForm.setValue({
      configcode: '',
      configdesc: '',
      configvalue: '',

    });
  }

  delecmd(configdetinp: configdb) {
    if (
      confirm(
        'Are you sure you want to delete configation ' + configdetinp.configdesc + '?'
      )
    ) {
      // Save it!
      // console.log('Thing was saved to the database.');
      var Chaptcd = configdetinp.configcode;
      this.arcctvService.idfld = configdetinp.configdesc;
      this.arcctvService.deleteitem(configdetinp).subscribe((data) => {
        this.configdet = this.configdet.filter((item) => item.configcode != Chaptcd);
        this.toast.success(
          'Record ' + Chaptcd + ' Deleted successfully',
          'configation Form',
          {
            timeOut: 1500,
          }
        );
        this.arcctvService.fldb = 'configdb';
        this.arcctvService.fetchAllrecord().subscribe((data) => {
          this.configdet = data;
          this.dataSource = new MatTableDataSource<configdb>(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
        //  this.wssmode = 'Maintenance'
        // this.router.navigate(['/configdb'], { queryParams: { wssmode: 'Maintenance' } })
      });
    } else {
      // Do nothing!
      //  console.log('Thing was not saved to the database.');
    }
  }
}
