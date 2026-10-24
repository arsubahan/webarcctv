import { Component, OnInit, Input } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ArcctvService } from '../arcctv.service';
import { ActivatedRoute, Router } from '@angular/router';
//import { loadPlayer, Player } from 'rtsp-relay/browser';
import { DatePipe, NgOptimizedImage } from '@angular/common';



@Component({
  selector: 'app-clviewmotion',
  standalone: true,
 imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    NgOptimizedImage
  ],
  templateUrl: './clviewmotion.component.html',
  styleUrl: './clviewmotion.component.css'
})
export class ClviewmotionComponent  implements OnInit {
  currentUrl: string = '';
  fldername: string = '';
  clid: string = '';
  currentDate;

  modetectarr: any[] = [];

  slideurl: String = '';

  imageObject: any;
  @Input() name: string;

  sliderImages: any[] = [];

  currentIndex: number = 0;
  timeoutId?: number;

  slideIndex = 0;
  wssfolder = '';
  fltype = '';
  slidesInSlideshow = 0;
  slidetot = 0;
  flvid = [];
  caption = [];
  piclist: any;
  rawDate = [];
  displayDate = '';

  constructor(
    private arcctvService: ArcctvService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUrl = this.router.url;
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.fldername = params['flderdate'];
      this.clid = params['clID'];
   //           console.log("\n\n andsfeqwtewtqwtqwt this.fldername = " + this.fldername);
      this.currentDate = new Date(this.fldername.substring(3, 5) + '-' + this.fldername.substring(0, 2) + '-' + this.fldername.substring(6, 10));
      //       console.log("\n\nthis.currentDate = " + this.currentDate + " and this.fldername = " + this.fldername);
    });

    this.arcctvService.fldb = "./../arcctv-web/public/clientimg/" + this.clid + "/" + this.fldername.replace(/-/g, '');
    this.arcctvService.fetchfiledir("F").subscribe((modetectdata) => {
      this.piclist = modetectdata;

    //  console.log("\n\nmodetectarr = " + JSON.stringify(this.piclist.length) + "\n\n");

      this.wssfolder = "clientimg/" + this.clid + "/" + this.fldername.replace(/-/g, '') + "/"
      this.slidetot = modetectdata.length;

      for (let i = 0; i < this.slidetot; i++) {
        this.rawDate[i] = this.piclist[i].substring(0, 15);
        this.rawDate[i] = this.piclist[i].substring(2, 4) + '-',
          this.rawDate[i] += this.piclist[i].substring(0, 2) + '-',
          this.rawDate[i] += this.piclist[i].substring(4, 8)
        this.rawDate[i] += this.piclist[i].substring(8, 11) + ':',

          this.rawDate[i] += this.piclist[i].substring(11, 13); // + ':',

        if (this.piclist[i].substring(13, 15) < '60') {
          this.rawDate[i] += ':' + this.piclist[i].substring(13, 15)  //+ ':',
        } else {
          this.rawDate[i] += ':' + '59'  //+ ':',
        }

        this.piclist[i] = modetectdata[i];


      }



      //  console.log("\n\n this.rawDate = " + JSON.stringify(this.rawDate) + "\n\n");
        // console.log("\n\n this.piclist= " + JSON.stringify(this.piclist) + "\n\n");





      this.currentIndex = 0;
      this.slideurl = this.wssfolder + this.piclist[this.currentIndex];
      this.displayDate = this.rawDate[this.currentIndex];

      //     console.log("\n\n this.piclist = " + JSON.stringify(this.piclist) + "\n\n");
      //    console.log("\n\n this.slideurl = " + JSON.stringify(this.slideurl) + "\n\n");

    })
  }
  async goToPrevious(): Promise<void> {
    if (this.currentIndex <= 0) {
      this.currentIndex = 1;
    } else {
      this.currentIndex = this.currentIndex - 1;
    }
    this.slideurl = await this.wssfolder + this.piclist[this.currentIndex];
    this.displayDate = this.rawDate[this.currentIndex];
    // window.location.reload();
  }

  async goToNext(): Promise<void> {
    if (this.currentIndex < this.slidetot - 1) {
      this.currentIndex = this.currentIndex + 1;
    }
    // window.location.reload();
    this.slideurl = await this.wssfolder + this.piclist[this.currentIndex];
    this.displayDate = this.rawDate[this.currentIndex];
  }

  async goToSlide(slIndex: number): Promise<void> {
    // this.resetTimer();
    this.currentIndex = slIndex;
    // console.log('\n\n slide index = ' + this.currentIndex);
    //   window.location.reload();
    console.log("\n\nslideurl = " + this.wssfolder + this.piclist[this.currentIndex])
    this.slideurl =  this.wssfolder + this.piclist[this.currentIndex];
    this.displayDate = this.rawDate[this.currentIndex];
  }

  async getCurrentSlideUrl() {

    //     // console.log("\n\n this.currentIndex = " + JSON.stringify(this.currentIndex) + "\n\n");
    //     //  this.rawDate = this.piclist[this.currentIndex].substring(0, 15);
    //     //  console.log("\n\n this.piclist[this.currentIndex] = " + this.piclist[this.currentIndex] + "\n\n");

    //  //   if (this.piclist[this.currentIndex] && this.piclist[this.currentIndex].length > 0) {



    //       // this.rawDate = this.piclist[this.currentIndex].substring(2, 4) + '-',
    //       //   this.rawDate += this.piclist[this.currentIndex].substring(0, 2) + '-',
    //       //   this.rawDate += this.piclist[this.currentIndex].substring(4, 8)
    //       // this.rawDate += this.piclist[this.currentIndex].substring(8, 11) + ':',

    //       //   this.rawDate += this.piclist[this.currentIndex].substring(11, 13); // + ':',

    //       // if (this.piclist[this.currentIndex].substring(13, 15) < '60') {
    //       //   this.rawDate += ':' + this.piclist[this.currentIndex].substring(13, 15)  //+ ':',
    //       // } else {
    //       //   this.rawDate += ':' + '59'  //+ ':',
    //       // }

    //       console.log("\n\n this.currentIndex[" + this.currentIndex + "] = " +  this.piclist[this.currentIndex] + "\n\n");
    this.slideurl = await this.wssfolder + this.piclist[this.currentIndex];
    //       //  console.log("current folder sdfgs = " + this.slideurl + "       this.rawDate = " + this.rawDate + "\n\n")
    return { sld: this.slideurl, dt: this.rawDate[this.currentIndex] };
    //    // } else {
    //    //   return '';
    //    // }
  }

}
