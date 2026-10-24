import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  authrunno,
  Clientdb,
  Videodb,
  Locationdb,
  Staffdb,
  Vidtypedb,
slidedet


} from './dbinterface';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ArcctvService {

 constructor(private _httpClient: HttpClient) { }

   apiUrl = environment.API_BASE_URL + 'api/data';

  baseurl: String =  environment.API_BASE_URL + '/getfile';
  flnameurl: String =  environment.API_BASE_URL + '/getflname';
  signupeurl: String =  environment.API_BASE_URL + '/signup';
  updateurl: String =  environment.API_BASE_URL + '/updrecord';
  deleteurl: String =  environment.API_BASE_URL + '/delrecord';
  createurl: String =  environment.API_BASE_URL + '/createrecord';
  uploadmimg: string =  environment.API_BASE_URL + '/multiplefiles';
  streamurl: string =  environment.API_BASE_URL + '/getstream';

  mailurl: string =  environment.API_BASE_URL + '/sendmail';

  resetokenurl: string =  environment.API_BASE_URL + '/forgot';
  resetpwordurl: string =  environment.API_BASE_URL + '/resetpword';


  evntcriturl =  environment.API_BASE_URL + '/getfilecrit';
  delcriturl =  environment.API_BASE_URL + '/delcrit';


  varsrch = {};
  varsrch2 = '';
  txtselitem = '';
  fldb = '';
  idfld: any = '';
  flretfldnm = ''
  wssfolder = '';
  m_files: File[] = [];
  mailOptions = {};

  modetype = ''; //mode - addd -A  modify - M   delete -D

  fetchAllrecord(): Observable<any> {
    var flnamesetup = this.fldb;
    console.log('\n\nthis fltyp = ' + flnamesetup + "      API_BASE_URL =    "    +  this.baseurl);

    return this._httpClient.post<any>(`${this.baseurl}/`, {
      fltyp: flnamesetup,
    });
  } //end for  fetchAllChapters

  fetchcrit(): Observable<any> {
    var flnamesetup = this.fldb;
    var txtsrch = this.varsrch;

        console.log('\n\n vlnamesetup= ' + JSON.stringify(txtsrch) + '\n\n');

    return this._httpClient.post<any>(`${this.evntcriturl}/`, {
      fltyp: flnamesetup,
      txtsrch,
    });
  } // end for fetchcritevntgal

  fetchfiledir(dirfl: string): Observable<any> {
    var flnamesetup = this.fldb;

        console.log('\n\n vlnamesetup= ' + JSON.stringify(flnamesetup) + '\n\n');

    return this._httpClient.post<any>(`${this.flnameurl}/`, {
      fltyp: flnamesetup,
      fldirtype: dirfl
     
    });
  } //

  fetchAllSlides(wsschapno: Number): Observable<slidedet[]> {
    // console.log('\n\nat srvice = ' + wsschapno + "   "  + wsschaptitle + '\n\n');
    // var test = this.fldb
    return this._httpClient.post<slidedet[]>(`${this.flnameurl}/`, {
      flder: "./../arcctv-web/public/f1/" + wsschapno
    });
  } //end for   fetchAllSlides


  createitem(data: any) {
    var flnamesetup = this.fldb;

    console.log('\n\n creatitem = ' + flnamesetup);

    return this._httpClient.post(`${this.createurl}/`, {
      data,
      fltyp: flnamesetup,
    });
  } //end for   createitem

  updateitem(data: any) {
    var flnamesetup = this.fldb;
    var id = this.idfld;

    console.log(
      '\n\n vlnamesetup= ' +
      flnamesetup +
      '           data.runno = ' +
      JSON.stringify(data) +

      "              id = " +
      id +


      '\n\n'
    );

    return this._httpClient.put(`${this.updateurl}/:${id}`, {
      data,
      fltyp: flnamesetup,
    });
  } //end for   updateitem

  deleteitem(data: any) {
    var flnamesetup = this.fldb;
    var id = this.idfld;

     const test = new HttpParams().set('fltyp:', flnamesetup);

    return this._httpClient.put(`${this.deleteurl}/${id}`, {
      fltyp: flnamesetup,
      data,
    });
  }

  delcrit(data: any) {
    console.log('\n\ndoing delcrit at siglapservice');

    var flnamesetup = this.fldb;
    var id = this.idfld;
    var txtsrch = this.varsrch;

    console.log('\n\ntxtsrch = ' + JSON.stringify(txtsrch) + '   flnamesetup = ' + flnamesetup + '   id = ' + id);

    return this._httpClient.post(`${this.delcriturl}`, {
      fltyp: flnamesetup,
      data,
      txtsrch,
    });
  }

  mailsub(data: any) {
    var m_option = this.mailOptions;

    console.log('\n\n m_option = ' + JSON.stringify(m_option) + '\n\n');

    return this._httpClient.post<any>(`${this.mailurl}/`, {
      data,
      m_option,
    });
  }

  forgotoken(data: any) {
    var flnamesetup = this.fldb;

    // console.log("\n\n data = " + JSON.stringify(data))

    return this._httpClient.post<any>(`${this.resetokenurl}/`, {
      data,
      fltyp: flnamesetup,
    });
  }

  respword(data: any, txtpassword) {
    //console.log("\n\ndata = " + JSON.stringify( data) + "       inptext = " + txtpassword)

    return this._httpClient.post<any>(`${this.resetpwordurl}/`, {
      data,
      txtpw: txtpassword,
    });
  }

  getstream(data: any, vidportno: number, modetype: string): Observable<any> {
    return this._httpClient.post<any>(`${this.streamurl}/`, {
      data,
      vidptno : vidportno,
      modetype: modetype
    });
  }

  getData(): Observable<any[]> {
    return this._httpClient.get<any[]>(this.apiUrl);
  }
}



