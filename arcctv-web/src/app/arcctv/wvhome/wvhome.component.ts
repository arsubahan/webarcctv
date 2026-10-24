import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  NgZone,
  OnDestroy,
  Input,
  AfterViewInit,
  signal,
  HostListener,
  inject,
  LOCALE_ID
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { ArcctvService } from '../arcctv.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Videodb } from '../dbinterface';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import id from '../../../lib/date-and-time/locale/id';
import { environment } from '../../../environments/environment';
import { formatDate } from '@angular/common'; // 1. Import the utility function
import { J } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-wvhome',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    NgOptimizedImage
  ],
  templateUrl: './wvhome.component.html',
  styleUrl: './wvhome.component.css'
})
export class WvhomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private locale = inject(LOCALE_ID);
  // Check if screen is mobile on initialization
  isMobile = signal(window.innerWidth < 768);


  // Update signal reactively when screen resizes
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile.set(window.innerWidth < 768);
  }

  // @ViewChild('videoCanvas') videoCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoCanvas', { static: true }) videoCanvas!: ElementRef;
  connectionStatus = 'Disconnected';


  //@Input() streamId: string = 'stream1'; // Dynamically pass stream IDs

  // @ViewChild('streamingCanvas', { static: false }) streamingCanvas!: ElementRef;

  [x: string]: any;
  clID = '';
  clname = '';
  picno = 1;


  currentUrl: string = '';
  fldername: string = '';
  clid: string = '';
  currentDate;



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
    private ngZone: NgZone,
    private authService: AuthService,
    private arcctvService: ArcctvService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  videodet: Videodb = {
    vidclcode: "",
    vidcltype: "",
    vidip: "",
    vidloc: "",
    vidlocpub: "",
    vidwsport: "",
    viduserid: "",
    vidpassword: "",
    vidcamno: 0
  }
  videodetail: Videodb[] = [];

  title = 'cctv';
  txtvidloc = '';
  rtspport;
  streamplayer: any;
  wsprotocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  wssUrl: string;

  modetectarr = [];

  otherdtearr = []



  isHovered: boolean = false;

  ngOnInit(): void {

    // prompt("is mobile = " + this.isMobile());  

    this.clID = sessionStorage.getItem("staffid") || '';
    this.clname = sessionStorage.getItem("Staffname") || '';
  }


  ngAfterViewInit(): void {
    this.arcctvService.fldb = "./../arcctv-web/public/clientimg/" + this.clID; this.arcctvService.fetchfiledir("D").subscribe((otherdtearr) => {
      this.piclist = otherdtearr;

      for (let j = 0; j < otherdtearr.length; j++) {
        // modetectdata.forEach((modetectfl, j) => {
        // console.log("\n\nmodetectfl = " + JSON.stringify(this.modetectarr[j]));
        if (!(otherdtearr[j]?.includes('.'))) {
          this.otherdtearr.push({ mdtdate: `${otherdtearr[j].substring(2, 4)}-${otherdtearr[j].substring(0, 2)}-${otherdtearr[j].substring(4, 8)}` });
          //              console.log("\n\nmodetectarrasfa[" + j + "] = " + JSON.stringify(this.modetectarr[j]));
        } else {
          //   this.modetectarr = this.modetectarr.slice(0, j);
          //            console.log("\n\n not folder this arr = " + JSON.stringify(this.modetectarr));
        }
        this.otherdtearr.sort((a, b) => new Date(b.mdtdate).getTime() - new Date(a.mdtdate).getTime());

      };




      /*===============================================
      ***       get video stream for this client  *****
      ================================================*/

      this.arcctvService.fldb = 'clvideodb';
      //var test = { evntgalcd: this.eventcd };
      this.arcctvService.varsrch = { vidclcode: this.clID };
      this.arcctvService.fetchcrit().subscribe(async (data) => {
        this.videodetail = data;
        if (this.videodetail.length > 0) {
          this.txtvidloc = this.videodetail[0].vidloc?.toString() || '';
        }
        //   console.log("\n\nvideodetail = " + JSON.stringify(this.videodetail));

        //    console.log("\n\nthis.videodetail.length = " + this.videodetail.length)

        var canvas = this.videoCanvas.nativeElement //  document.getElementById('video-canvas');
        //   var url;
        // var player;

        for (let i = 0; i < this.videodetail.length; i++) {
          //  for (let i = 1; i < 3; i++) {

          this.rtspport = Number(this.videodetail[i].vidwsport) + (10 + Number(i))

          //  //  console.log("\n\ni =  " + i + " with IP: " + this.rtspport);

          this.arcctvService.getstream(this.videodetail[i], this.rtspport, "Start").subscribe((streamData) => {

            //  console.log("\n\nReceived stream data: ", JSON.stringify(streamData));
            //
            this.wssUrl = this.wsprotocol + "://" + environment.API_BASE_WS + '/ws/' + this.videodetail[i].vidclcode + "-" + this.videodetail[i].vidloc //+ i; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
            //   this.wssUrl = this.wsprotocol + "://" + environment.API_BASE_WS + ":" + this.rtspport     + '/ws/' + this.videodetail[i].vidclcode + "-" + this.videodetail[i].vidloc //+ i; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
            // url = `ws://localhost:` + this.rtspport + "/api/view-live/" ; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
            //     console.log("\n\nwssUrl = " + this.wssUrl + "\n\n");


            this.streamplayer = new JSMpeg.Player(this.wssUrl, {
              canvas: canvas,
              autoplay: true,
              audio: true,
              // width: '100%',
              // height: 288,
              loop: true,
              onSourceEstablished: () => {
                // Force Angular to recognize the state change
                this.ngZone.run(() => {
                  this.connectionStatus = 'Connected (Streaming)';
                });
              },
              onDisconnect: () => {
                this.ngZone.run(() => {
                  this.connectionStatus = 'Disconnected';
                });
              }

            })

          }) //at arcctv  service -getstream


        } // end ofif videodetail length > 0

      }) // end of arcctv service fetchcrit

      this.currentDate = formatDate(new Date, "dd MMM yyyy", this.locale)
      this.fldername = formatDate(this.currentDate, "dd-MM-yyyy", this.locale)
      //this.fldername = this.currentdate

      this.getpictures()

    })
  }

  async getpictures() {
    this.arcctvService.fldb = "./../arcctv-web/public/clientimg/" + this.clID + "/" + this.fldername.replace(/-/g, '');


    console.log("\n\nthis.fldername = " + this.currentDate + " and this.fldername = " + this.fldername);



    //console.log("\n\nthis.arcctvService.fldb = " + this.fldername);

    // getpictures()
    this.arcctvService.fetchfiledir("F").subscribe((modetectdata) => {
      this.piclist = modetectdata;

      console.log("\n\nmodetectarr = " + JSON.stringify(this.piclist.length) + "\n\n");

      this.wssfolder = "clientimg/" + this.clID + "/" + this.fldername.replace(/-/g, '') + "/"
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
      //   console.log("\n\n this.piclist= " + JSON.stringify(this.piclist) + "\n\n");



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
    this.slideurl = await this.wssfolder + this.piclist[this.currentIndex];
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



  openMotionDetection(motionDate: string) {
    // Implementation for opening motion detection
    motionDate = motionDate.replace(/-/g, ''); // Remove dashes from the date string
    motionDate = `${motionDate.substring(2, 4)}-${motionDate.substring(0, 2)}-${motionDate.substring(4, 8)}`;


    console.log("\n\nOpening motion detection for date: " + motionDate);
    this.router.navigate(['arcctv/clviewmotion'], {
      queryParams: {
        flderdate: motionDate,
        clID: this.clID
      },
    })
  }

  stopStreaming(): void {

    console.log("\n\ndoing stop streaming .....\n\n")
    if (this.streamplayer) {
      // Gracefully stop the stream and close the WebSocket
      if (this.streamplayer.source && typeof this.streamplayer.source.destroy === 'function') {
        this.streamplayer.source.destroy();
      } else if (typeof this.streamplayer.destroy === 'function') {
        this.streamplayer.destroy();
      }
      // this.arcctvService.getstream([], this.rtspport, "close").subscribe((streamData) => {
      //   // this.streamplayer.destroy();

      //   console.log("\n\nclosing of streaming ....." + streamData + "\n\n")

      // })
      this.streamplayer = null;
    }
  }
  enlargeVideo(): void {
    if (this.isHovered === false) {
      console.log("\n\nEnlarging video...");
      this.stopStreaming();
      this.isHovered = true;
      var canvas = document.getElementById('video-canvas');
      // url;
      // url = environment.API_BASE_WS + ":" + this.rtspport + "/ws/";
      this.streamplayer = new JSMpeg.Player(this.wssUrl, {
        canvas: canvas, // CRITICAL: Target nativeElement
        autoplay: true,
        audio: true,
        // width: '100%',
        // height: 288,
        loop: true
      })
    }

  }

  ngOnDestroy(): void {
    // Ensure the stream stops and memory is freed when the component unloads
    this.stopStreaming();
  }

  startZoom(): void {
    // const canvas = this.videoCanvas.nativeElement;
    var canvas = document.getElementById('video-canvas');
    canvas.style.transform = 'scale(5.9)'; // Enlarge the live stream by 20% on hover
    canvas.style.zIndex = '50';
  }

  resetZoom(): void {
    // const canvas = this.videoCanvas.nativeElement;
    var canvas = document.getElementById('video-canvas');
    canvas.style.transform = 'scale(1)'; // Reset to original size
    canvas.style.zIndex = '1';
  }



  getotherpic() {
    this.arcctvService.fldb = "./../arcctv-web/public/clientimg/" + this.clID;

    //console.log("\n\nthis.arcctvService.fldb = " + this.arcctvService.fldb);

    this.arcctvService.fetchfiledir("D").subscribe((modetectdata) => {
      //  this.modetectarr = modetectdata;
      console.log("\n\nmodetectdata = " + JSON.stringify(modetectdata));

      for (let j = 0; j < modetectdata.length; j++) {
        // modetectdata.forEach((modetectfl, j) => {

        console.log("\n\nmodetectfl = " + JSON.stringify(this.modetectarr[j]));

        if (!(modetectdata[j]?.includes('.'))) {
          this.modetectarr.push({ mdtdate: `${modetectdata[j].substring(2, 4)}-${modetectdata[j].substring(0, 2)}-${modetectdata[j].substring(4, 8)}` });

          console.log("\n\nmodetectarrasfa[" + j + "] = " + JSON.stringify(this.modetectarr[j]));

        }
        else {
          //   this.modetectarr = this.modetectarr.slice(0, j);
          console.log("\n\n not folder this arr = " + JSON.stringify(this.modetectarr));
        }
        this.modetectarr.sort((a, b) => new Date(b.mdtdate).getTime() - new Date(a.mdtdate).getTime());

      };


    })

  }
  onOptionSelected(event: Event): void {
    const element = event.target as HTMLSelectElement;
    const selectedValue = element.value;

    console.log('Selected value:', selectedValue);

    this.currentDate = formatDate(selectedValue, "dd MMM yyyy", this.locale)
    this.fldername = formatDate(this.currentDate, "dd-MM-yyyy", this.locale)

    this.getpictures()

  }



}
