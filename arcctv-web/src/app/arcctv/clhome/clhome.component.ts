import { Component, ElementRef, ViewChild, OnInit, NgZone, OnDestroy, Input, AfterViewInit } from '@angular/core';
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
import { DatePipe } from '@angular/common';
import id from '../../../lib/date-and-time/locale/id';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clhome',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './clhome.component.html',
  styleUrl: './clhome.component.css'
})
export class ClhomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // @ViewChild('videoCanvas') videoCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('videoCanvas', { static: true }) videoCanvas!: ElementRef;
  connectionStatus = 'Disconnected';


  //@Input() streamId: string = 'stream1'; // Dynamically pass stream IDs

  // @ViewChild('streamingCanvas', { static: false }) streamingCanvas!: ElementRef;

  [x: string]: any;
  clID = '';
  clname = '';
  picno = 1;



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
  wsprotocol  = window.location.protocol === 'https:' ? 'wss' : 'ws';
  wssUrl: string;

  modetectarr = [];

  isHovered: boolean = false;

  ngOnInit(): void {

    this.clID = sessionStorage.getItem("staffid") || '';
    this.clname = sessionStorage.getItem("Staffname") || '';
  }


  ngAfterViewInit(): void {

    this.arcctvService.fldb = 'clvideodb';
    //var test = { evntgalcd: this.eventcd };
    this.arcctvService.varsrch = { vidclcode: this.clID };
    this.arcctvService.fetchcrit().subscribe(async (data) => {
      this.videodetail = data;
      if (this.videodetail.length > 0) {
        this.txtvidloc = this.videodetail[0].vidloc?.toString() || '';
      }
      //   console.log("\n\nvideodetail = " + JSON.stringify(this.videodetail));

      console.log("\n\nthis.videodetail.length = " + this.videodetail.length)
 
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
          this.wssUrl = this.wsprotocol + "://" + environment.API_BASE_WS +  '/ws/' + this.videodetail[i].vidclcode + "-" + this.videodetail[i].vidloc //+ i; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
      //   this.wssUrl = this.wsprotocol + "://" + environment.API_BASE_WS + ":" + this.rtspport     + '/ws/' + this.videodetail[i].vidclcode + "-" + this.videodetail[i].vidloc //+ i; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
          // url = `ws://localhost:` + this.rtspport + "/api/view-live/" ; // Assuming the server is running on 172.19.0.4 and the port is dynamic based on the camera index
console.log("\n\nwssUrl = " + this.wssUrl + "\n\n");


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
        this.arcctvService.fldb = "./../arcctv-web/public/clientimg/" + this.clID;

        this.arcctvService.fetchfiledir("D").subscribe((modetectdata) => {
          //  this.modetectarr = modetectdata;
          //         console.log("\n\nmodetectdata = " + JSON.stringify(modetectdata));

          for (let j = 0; j < modetectdata.length; j++) {
            // modetectdata.forEach((modetectfl, j) => {
            // console.log("\n\nmodetectfl = " + JSON.stringify(this.modetectarr[j]));
            if (!(modetectdata[j]?.includes('.'))) {
              this.modetectarr.push({ mdtdate: `${modetectdata[j].substring(2, 4)}-${modetectdata[j].substring(0, 2)}-${modetectdata[j].substring(4, 8)}` });
              //              console.log("\n\nmodetectarrasfa[" + j + "] = " + JSON.stringify(this.modetectarr[j]));
            } else {
              //   this.modetectarr = this.modetectarr.slice(0, j);
              //            console.log("\n\n not folder this arr = " + JSON.stringify(this.modetectarr));
            }
            this.modetectarr.sort((a, b) => new Date(b.mdtdate).getTime() - new Date(a.mdtdate).getTime());

          };
        })
      } // end ofif videodetail length > 0


    })

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

//  ngOnDestroy() {
//  console.log('Leaving page - stopping live stream');

//   // Stop JSMpeg
//   if (this.streamplayer) {
//     this.streamplayer.destroy();
//     this.streamplayer = undefined;
//   }

//   // Close WebSocket
//   if (this.wsUrl) {
//     this.this.wsUrl.close(1000, 'Page closed');
//     this.wsUrl = undefined;
//   }
// }

  ngOnDestroy(): void {
    // Ensure the stream stops and memory is freed when the component unloads
    this.stopStreaming();
  }

  //  ngOnDestroy(): void {docker 
  //   if (this.streamplayer) {
  //     console.log("\n\nDestroying stream player...") ;
  //   this.streamplayer.destroy(); // <--- This stops the stream
  //   this.streamplayer = null;
  // }
  //}

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




}
