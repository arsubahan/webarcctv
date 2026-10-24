import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Staffdb, authrunno, Visitdb, logindb, cllogindb, } from './dbinterface';
import { Observable } from 'rxjs/internal/Observable';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signupeurl: String = environment.API_BASE_URL + '/signup';
  logineurl: String = environment.API_BASE_URL + '/login';
  signupdateurl: String = environment.API_BASE_URL + '/updrecord';
  livestreamurl: String = environment.API_BASE_URL + '/livestream';


  authfldb = '';
  authflid = '';
  authfltype = '';
  authlogintype = '';
  authToken = '';
  authind = "nok";
  isStart: string = "";

  private token: string = '';
  private userid: String = '';
  private username: String = '';
  private authenticatedSub = new Subject<boolean>();
  private isAuthenticated = false;
  private logoutTimer: any;

  getIsAuthenticated() {
    return this.isAuthenticated;
  }
  getAuthenticatedSub() {
    return this.authenticatedSub.asObservable();
  }
  getToken() {
    return this.token;
  }


  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService
  ) { }

  signup(data: any): Observable<Staffdb[]> {
    var flnamesetup = this.authfldb;

    console.log("\n\n create red flnamesetup = " + flnamesetup)

    return this.http.post<Staffdb[]>(`${this.signupeurl}/`, {
      data,
      fltyp: flnamesetup,
    });
  } //end for   createitem

  updatestaff(data: any, wssmode: string) {
    var flnamesetup = this.authfldb;
    var wssid = '';
    if (wssmode == 'A') {
      wssid = data.UsStaffcd;
    } else if (wssmode == 'C' || wssmode == 'W') {
      wssid = data.clcode;
    }

    //  if (wssmode == 'C') {

    console.log("\n\nauthfldidi = " + JSON.stringify(data))

    return this.http.put(`${this.signupdateurl}/${wssid}`,
      {
        fltyp: flnamesetup,
        data,
      }
    );
  }

  loginUser(staffcd: string, pword: string) {
    var flnamesetup = this.authfldb;
    //  var   authData ={};


    //   console.log("\n\nthis.authflid  = " + this.authfltype + "      ")

    if (this.authfltype == 'A') {
      const authData: logindb = {
        UsStaffcd: staffcd,
        UsPassword: pword,
      };
      return this.http
        .post<{
          token: string;
          expiresIn: number;
          userid: String;
          username: String;
          //   userlevel: String;
        }>(`${this.logineurl}/`, {
          fltyp: flnamesetup,
          authData,
          type: 'A'
        })
        .subscribe({
          next: (res) => {
            //    alert(JSON.stringify(res))
            this.token = res.token;
            this.userid = res.userid;
            this.username = res.username;
            //  this.userlevel = res.userlevel

            if (this.token) {
              this.authenticatedSub.next(true);
              // if (this.authfltype == 'Admin') {
              this.authlogintype = 'A';
              //} else {
              this.isAuthenticated = true
              // }
              this.router.navigate(['/dashboard']);
              this.logoutTimer = setTimeout(() => {
                this.logout();
              }, res.expiresIn * 1000);
              const now = new Date();
              const expiresDate = new Date(now.getTime() + res.expiresIn * 1000);
              this.storeLoginDetails(
                this.token,
                expiresDate,
                res.userid,
                res.username,
                this.authfltype,
                //       res.userlevel
              );
            }
          },
          error: (res) => {
            this.toast.error(res.error.message, 'Login Error', {
              timeOut: 1500,
            });
          },
        });
    } else {
      //  console.log("\n\n doing client")
      //  const authfltype = "C";
      const authData: cllogindb = {
        clcode: staffcd,
        clpassword: pword,
      };

      //    console.log("\n\nstaffcd = " + staffcd + "       authData = " + JSON.stringify(authData))
      return this.http.post<{
        token: string;
        expiresIn: number;
        userid: String;
        username: String;
      }>
        (`${this.logineurl}/`,
          {
            fltyp: flnamesetup,
            authData,
            type: this.authfltype
          })
        .subscribe({
          next: (res) => {
            //           console.log("\n\n from auth...." + JSON.stringify(res));
            this.token = res.token;
            this.userid = res.userid;
            this.username = res.username;

            if (this.token) {
              this.authenticatedSub.next(true);
              this.isAuthenticated = true;
              this.authlogintype = this.authfltype;

               if (this.authfltype == 'C') {
                this.router.navigate(['/clhome'], { queryParams: { loginind: this.authfltype } });
              }
              this.logoutTimer = setTimeout(() => {
                this.logout();
              }, res.expiresIn * 1000);
              const now = new Date();
              const expiresDate = new Date(now.getTime() + res.expiresIn * 1000);
              this.storeLoginDetails(
                this.token,
                expiresDate,
                res.userid,
                res.username,
                this.authfltype,
              );
            }
          },
          error: (res) => {
            this.toast.error(res.error.message, 'Client Login Error', {
              timeOut: 1500,
            });
          },
        });

    }
  }

  livestr(): Observable<any> {
    var flnamesetup = this.authfldb;

    console.log("\n\n livestream flnamesetup = " + flnamesetup)

    return this.http.post<any>(`${this.livestreamurl}/`, {

    });
  } //end for   livestream


  storeLoginDetails(
    token: string,
    expirationDate: Date,
    staffid: any,
    staffname: any,
    stype: string,
    //  schapter: any
  ) {
    //  console.log('\n\nstaffid = ' + stype);
    // this.isStart = 'y'

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('expiresIn', expirationDate.toISOString());
    sessionStorage.setItem('staffid', staffid);
    sessionStorage.setItem('Staffname', staffname);
    sessionStorage.setItem("stype", stype);

  }

  getLocalStorageData() {
    const token = sessionStorage.getItem('token');
    const expiresIn = sessionStorage.getItem('expiresIn');

    if (!token || !expiresIn) {
      return "";
    }
    return {
      'token': token,
      'expiresIn': new Date(expiresIn)
    }
  }

  authenticateFromLocalStorage() {
    const localStorageData = this.getLocalStorageData();
    if (localStorageData) {
      const now = new Date();
      const expiresIn = localStorageData.expiresIn.getTime() - now.getTime();

      if (expiresIn > 0) {
        this.token = localStorageData.token;
        this.isAuthenticated = true;
        this.authenticatedSub.next(true);
        //  this.logoutTimer.setTimeout(expiresIn);
      }
    }
  }

  logout() {
    //  alert("doing logout")
    this.token = '';
    this.isAuthenticated = false;
    this.authenticatedSub.next(false);
    this.router.navigate(['/']);
    clearTimeout(this.logoutTimer);
    sessionStorage.clear();
    this.authlogintype = '';
  }

  clearLoginDetails() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiresIn');
    sessionStorage.removeItem('staffid');
    sessionStorage.removeItem('Staffname');
    sessionStorage.removeItem('stype');
  }
}

export const matchpassword: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  let Password = control.get('UsPassword');
  let verPword = control.get('verPassword');

  /// console.log("\n\n Password = " +JSON.stringify(Password)  + "     verPword = " + JSON.stringify(verPword))

  if (Password && verPword && Password?.value != verPword?.value) {
    return {
      passwordmatcherror: true,
    };
  }
  return null;
};

export const clmatchpassword: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  let clPassword = control.get('clpassword');
  let clverPword = control.get('verpassword');

  // console.log("\n\n Password = " + clPassword + "     verPword = " + clverPword)

  if (clPassword && clverPword && clPassword?.value != clverPword?.value) {
    return {
      classwordmatcherror: true,
    };
  }
  return null;
};
