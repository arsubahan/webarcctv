const express = require("express"),
    session = require("express-session"),
    app = express(),
    cors = require("cors"),
    requestIp = require("request-ip"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),

    Websocket = require('ws'),
    path = require("path"),
    port = process.env.PORT || 3265,
    net = require('net'),
    killport = require('kill-port'),

    admin = require('firebase-admin'),
    { initializeApp } = require('firebase-admin/app'),
    serviceAccount = require("./arazcctvapp-firebase-adminsdk-fbsvc-b7c92026e1.json"),

    cron = require('node-cron'),

    { detect } = require('detect-port'),


    fs = require("fs"),
    ffmpeg = require("fluent-ffmpeg"),
    ffmpegPath = require("ffmpeg-static"),
    extractFrames = require("ffmpeg-extract-frames"),
    Stream = require("node-rtsp-stream"),
    { proxy } = require('rtsp-relay')(app),

    onvif = require("node-onvif"),
    sharp = require("sharp"),

    getPixels = require("get-pixels"),
    imageSize = require("image-size"),

    datefmt = require('date-and-time'),

    nodemailer = require("nodemailer");

const { convert } = require('html-to-text');

ffmpeg.setFfmpegPath(ffmpegPath);

const { spawn } = require('child_process');
//const { exec } = require('child_process');
const command = ' lsof -t -i:8000';

const db = require("./dbstream");


//Express Session
app.use(
    session({
        key: "user_sid",
        secret: "arcctv-web1436946140videostream",
        saveUninitialized: true,
        resave: false,
        cookie: { maxAge: 60 * 60 * 1000 },
    })
);

app.use(
    cors({
        origin: '*', // 'https://www.arazcctv.com',
        credentials: true,
    })
);

// BodyParser Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //'https://www.arazcctv.com');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("arsubahancctvstream"));

app.post("/sendmail", (req, res) => {
    // Create a transporter

    console.log("\n\nreqa.body = " + JSON.stringify(req.body) + "\n\n");
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // 'smtp.mail.yahoo.com',
        port: 587, //465,
        service: "gmail",
        logger: true,
        debug: true,
        secureconnection: false,
        //  secure: false,
        auth: {
            user: "arsubahan@gmail.com",
            pass: "apxf goec ycie uage",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    // Email options
    let mailOptions = {
        from: req.body.m_option.from,
        to: req.body.m_option.to,
        subject: req.body.m_option.subject,
        text: convert(req.body.m_option.html),
    };
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("Error: ", error);
        }
        console.log("Email sent: " + info.response);
    });
});

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

var wssvidono = [];

// var wsspicind = 40;
var pX;
var pY;
var channels;
// var wsscoind = 0;
var wsscoefsub1 = [];
var wsscoefsub2 = [];
var wsscoeftot = [];
var wssmot = 0;
var rowno = 0;
var wsspicind = 40;
var wsscorrind = [];
var sendimgind = "n"

var inbox, maxbox, totbox, minmdt, maxmdt;



var filedb = require('./dbmodels/clvideodb');
var configfdb = require('./dbmodels/configdb');

process.on('uncaughtException', async (error, origin) => {

    console.log("\n\nerr uncaughtException = " + error + "      origin = " + origin)

    await isPortAvailable(port).then(async isAvailable => {
        if (isAvailable) {
            server = app.listen('0.0.0.0', port, async function () {
                // var port = server.address().port;
                console.log('from process uncaughtException on Listening on port : ' + JSON.stringify(server.address().port));
                stremind = 'n'

            })
        } else {
            console.log("\n\nport uncaughtException not available")
        }
        // await filedb.find()
        //     .then(async function (fldata) {
        //         await getrec(fldata)
        //         await processimg(fldata)
        //     }) // end of filedb.find  
        startstream();
    })
})

process.on('unhandledRejection', async (error, origin) => {

    console.log("\n\nerr unhandledRejection = " + error + "      origin = " + JSON.stringify(origin))

    await isPortAvailable(port).then(async isAvailable => {
        if (isAvailable) {
            server = app.listen(port, '0.0.0.0', async function () {
                // var port = server.address().port;
                console.log('from process unhandledRejection on Listening on port : ' + JSON.stringify(server.address().port));
                stremind = 'n'

            })
        } else {
            console.log("\n\nport unhandledRejection not available")
        }
        // await filedb.find()
        //     .then(async function (fldata) {
        //         await getrec(fldata)
        //         await processimg(fldata)
        //     }) // end of filedb.find  
        startstream();
    })
})

server = app.listen(port, '0.0.0.0', async function () {
    // var port = server.address().port;
    console.log('from raz Listening on port : ' + JSON.stringify(server.address().port));


    // await filedb.find()
    //     .then(async function (fldata) {
    //         await getrec(fldata)
    //         await processimg(fldata)
    //     }) // end of filedb.find  
    startstream();
    //const retoken = await getTokensAndSendNotification();

    // console.log('Retoken = ' + JSON.stringify(retoken[0].clandtoken));

})


async function startstream() {

    try {
        console.log("\n\nstarting live startstream ....")

        var i = 0;
        //const registrationToken = await 
        //  getRegistrationTokenFromDatabase(); // Implement this function to retrieve the token from your database 
        await configfdb.find()
            .then(async function (flconfig) {
                configdet = flconfig
                flconfig.forEach((flconfig) => {
                    if (flconfig.configdesc.includes("pixstart")) {
                        inbox = Number(flconfig.configvalue);
                        console.log(`\n\ninbox: ${flconfig.configdesc} - ${inbox}`);
                    }
                    if (flconfig.configdesc.includes("pixend")) {
                        maxbox = Number(flconfig.configvalue);
                        console.log(`\n\n maxbox: ${flconfig.configdesc} - ${maxbox}`);
                    }
                    if (flconfig.configdesc.includes("totbox")) {
                        totbox = Number(flconfig.configvalue);
                        console.log(`\n\ntotbox: ${flconfig.configdesc} - ${totbox}`);
                    }
                    if (flconfig.configdesc.includes("mIn-mdetct")) {
                        minmdt = Number(flconfig.configvalue);
                        console.log(`\n\nminmdt: ${flconfig.configdesc} - ${minmdt}`);
                    }
                    if (flconfig.configdesc.includes("Max-mdetct")) {
                        maxmdt = Number(flconfig.configvalue);
                        console.log(`\n\nmaxmdt: ${flconfig.configdesc} - ${maxmdt}`);
                    }                  
                       if (flconfig.configdesc.includes("coemin")) {
                            imgcoemin = Number(flconfig.configvalue);
                            console.log(`\n\nm imgcoemin: ${flconfig.configdesc} - ${ imgcoemin.toFixed(3)}`);
                        }
                        if (flconfig.configdesc.includes("coemax")) {
                            imgcoemax = Number(flconfig.configvalue);
                            console.log(`\n\nm imgcoemax: ${flconfig.configdesc} - ${ imgcoemax.toFixed(3)}`);
                        }          });
            })

        await filedb.find()
            .then(async function (fldata) {
                await getrec(fldata)
                //     await processimg(fldata)
            }) // end of filedb.find  

        cron.schedule('*/30 * * * *', async () => {
            i = i + 1
            console.log("Checking for stream updates..." + i);

            await configfdb.find()
                .then(async function (flconfig) {
                    configdet = flconfig
                    flconfig.forEach((flconfig) => {
                        if (flconfig.configdesc.includes("pixstart")) {
                            inbox = Number(flconfig.configvalue);
                            console.log(`\n\ninbox: ${flconfig.configdesc} - ${inbox}`);
                        }
                        if (flconfig.configdesc.includes("pixend")) {
                            maxbox = Number(flconfig.configvalue);
                            console.log(`\n\n maxbox: ${flconfig.configdesc} - ${maxbox}`);
                        }
                        if (flconfig.configdesc.includes("totbox")) {
                            totbox = Number(flconfig.configvalue);
                            console.log(`\n\ntotbox: ${flconfig.configdesc} - ${totbox}`);
                        }
                        if (flconfig.configdesc.includes("coemin")) {
                            imgcoemin = Number(flconfig.configvalue);
                            console.log(`\n\nm imgcoemin: ${flconfig.configdesc} - ${ imgcoemin.toFixed(3)}`);
                        }
                        if (flconfig.configdesc.includes("coemax")) {
                            imgcoemax = Number(flconfig.configvalue);
                            console.log(`\n\nm imgcoemax: ${flconfig.configdesc} - ${ imgcoemax.toFixed(3)}`);
                        }
                    });
                })

            await filedb.find()
                .then(async function (fldata) {
                    await getrec(fldata, configdet)
                    //   await processimg(fldata)
                }) // end of filedb.find   
        })
    } catch (error) {
        console.error("Error occurred while starting stream:", error)
    }

}

async function getrec(datafl) {
    try {
        // if (stremind == 'n') {
        /*************************************************
       * get original screen shot e for comaparison
       ************************************************/
        datafl.forEach(async function (value, key) {
            await isPortAvailable(value.vidwsport).then(async isAvailable => {
                if (isAvailable) {
                    if (value.vidcltype != "IE") {

                        /********************************************
                         *****   set imnage location and rstp     ***
                         *******************************************/
                        wsslocpic = value.vidloc
                            .substring(parseInt(value.vidloc.length - 9))
                            .replace("(", "")
                            .replace(")", "");
                        wsslocpic = "./arcctv-web/public/clientimg/" + value.vidclcode + "/" + wsslocpic;

                        console.log(
                            "\n\nsstart wsslocpic  = " + JSON.stringify(wsslocpic) + "\n\n"
                        );
                        console.log("\n\nsstart wsslocpic  = " + JSON.stringify(wsslocpic) + "\n\n")


                        console.log(value.vidip.substr(0, 3))

                        if (value.vidip.substr(0, 3) == "192") {
                            //    console.log("\n\ndispip = " + value.vidip + "\n\n")
                            try {
                                await getovinf(value, filedb)
                            } catch (err) {
                                //   console.log("\n\n" + err + "  error from try in onvif......\n\n")
                                //   return res.status(500).send();
                            }
                        }

                        if (value.vidpassword.indexOf(":") < 0) {
                            value.vidpassword = ":" + value.vidpassword
                        }
                        wssrstp = "rtsp://" + value.viduserid + value.vidpassword + "@" + value.vidip + ":" + value.vidlocpub
                        console.log("\n\nstarting ip adres = " + wssrstp + "\n\n")
                        //  try {

                        //  console.log("\n\nvidiup = " + value.vidip + "\n\n")

                        // if (value.vidip != undefined) {
                        await getstream(value, wssrstp, key, "s")

                        console.log("\n\nstarting ip adres = " + wssrstp + "     key = " + key + "\n\n")
                        //   await extractpic(wsslocpic, wssrstp, "s")
                        // }
                        // } catch (error) {
                        //    console.error("streaming error...." + value.vidclcode + "     ip address = " + value.vidip + "\n\n")
                        // }

                    } else { //nd of  vidcltype != IE
                        console.log('camear uses internet explorer')
                    }

                } else {
                    console.log('Port ' + value.vidwsport + ' isn   = ' + isAvailable);
                }
            });
        })// end of fldata.Foreach
        // stremind = 'y'
        // } // end of stremind = n
    } catch (error) {
        console.error("Error occurred while processing data:", error);
    }
}

async function isPortAvailable(wssport) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            // if (err.code === 'EADDRINUSE') {
            //     resolve(false); // Port is occupied
            // } else {
            //     resolve(false); // Other errors (e.g., access denied)
            // }
            // killport(wssport, 'tcp')
            //   server.close(() => {
            //     resolve(true); // Port is free
            // });
            killport(wssport, 'tcp')
                .then(() => console.log('Port ' + wssport + ' has been cleared.'))
                .catch((err) => console.error('Error killing port:', err));
        });


        server.once('listening', () => {
            server.close(() => {
                resolve(true); // Port is free
            });
        });

        server.listen(wssport, '0.0.0.0');
    });
}

async function getovinf(datavalue, wssdb) {
    try {
        await onvif.startProbe().then((device_info_list) => {
            console.log(
                "\n\n from getovnifn = " +
                JSON.stringify(device_info_list) +
                " devices were found."
            );
            //  Show the device name and the URL of the end point.
            device_info_list.forEach((info) => {
                wssip = info.xaddrs[0].substr(
                    parseInt(info.xaddrs[0].indexOf("//") + 2),
                    info.xaddrs[0].indexOf(":8000") - 7
                );
                if (wssip != datavalue.vidip && wssip.substr(0, 3) == "192") {
                    //   console.log("\n\nonvif_ip = " + wssip + "value id = " + "\n\n")
                    datavalue.vidip = wssip;

                    updipcam(datavalue, wssdb)
                }
            });
        });
    } catch {
        console.log("\n\n cannot find device....\n\n");
    }
}

async function updipcam(wssdata, filedb) {
    const flupdb = await filedb.findByIdAndUpdate(
        { _id: wssdata._id },
        wssdata,
        { new: true }
    );
    console.log("\n\nflupdb at 126 = " + flupdb);
}

async function getstream(videtail, rstpadd, wsskey, wsstype) {

    try {
        console.log(`[${videtail.vidcamno}] Starting FFmpeg parser...`);
        // Video dimensions (Must exactly match across stream, reference, and calculations)
        const WIDTH = 640;
        const HEIGHT = 480;
        const FRAME_SIZE = WIDTH * HEIGHT * 3;

        var origind = 'y'

        // Marker constants for JPEG images
        const JPEG_SOI = Buffer.from([0xff, 0xd8]);
        const JPEG_EOI = Buffer.from([0xff, 0xd9]);

        wsslocpic = videtail.vidloc.substring(parseInt(videtail.vidloc.length - 9)).replace("(", '').replace(")", '');
        wsslocpic = './../arcctv-web/public/clientimg/' + videtail.vidclcode + "/" + wsslocpic



        // FFmpeg arguments optimized to decode once and drop extra frames on arrival
        const ffmpegArgs = [
            '-rtsp_transport', 'tcp',        // Forces TCP stability over UDP packet drops
            '-i', rstpadd,                   // RTSP input stream URL
            '-vf', 'fps=1/2',                // Filter: Drop/select 1 frame every 3 seconds
            '-f', 'mjpeg',                   // Multiplex into raw MJPEG container
            '-q:v', '2',                     // Quality scale: High quality (1-31 scale)
            '-'                         // Direct output to Node.js stdout stream
        ];

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

        let chunkBuffer = Buffer.alloc(0);
        let firstFrame = null;
        let frameCount = 0;

        ffmpegProcess.stdout.on('data', async (chunk) => {
            // Append newly arrived stream bytes into an in-memory buffer
            chunkBuffer = Buffer.concat([chunkBuffer, chunk]);

            while (true) {
                const startIndex = chunkBuffer.indexOf(JPEG_SOI);
                if (startIndex === -1) {
                    // Clear metadata or partial headers prior to actual image frames
                    chunkBuffer = Buffer.alloc(0);
                    break;
                }

                // Read past previous frame garbage data if necessary
                if (startIndex > 0) {
                    chunkBuffer = chunkBuffer.subarray(startIndex);
                }

                const endIndex = chunkBuffer.indexOf(JPEG_EOI);
                if (endIndex === -1) {
                    break; // Incomplete image block; wait for more network frames
                }

                // Complete frame detected! Isolate it from remaining buffer payload
                const totalFrameSize = endIndex + JPEG_EOI.length;
                const jpegFrame = chunkBuffer.subarray(0, totalFrameSize);

                //  saveFrame(videtail.vidcamno, jpegFrame);
                /*=======================================================================
                * save the extracted frame to disk or database for further processing  
                 *======================================================================*/

                if (!firstFrame) {
                    firstFrame = jpegFrame;
                    console.log('✅ Baseline reference frame captured.');
                    //   return;
                } else {
                    console.log('\n\nProcessing frame #' + (++frameCount));

                    // processimg(videtail, firstFrame, jpegFrame, WIDTH, HEIGHT, wsslocpic, ++frameCount); // Return the extracted JPEG frame for further processing
                    await getimage(firstFrame, jpegFrame, wsslocpic, frameCount)
                    firstFrame = await update_motion(videtail, firstFrame, jpegFrame, "./../arcctv-web/public/clientimg/" + videtail.vidclcode + "/",
                        videtail.vidloc.substring(parseInt(videtail.vidloc.length - 9)).replace("(", '').replace(")", ''), wssmot, wsscorrind)
                }


                console.log("\n\ncontinie to next frame for processing....\n\n")

                // Slice out extracted image data and advance pointer forward
                chunkBuffer = chunkBuffer.subarray(totalFrameSize);
            }
        })
    } catch {
        console.log("from getstream - istreaming error....")
        //      //     //  wssok = ""
        //      //     //  return wssok
    }

}

async function getimage(imgorigname, imgname, wsslocpic, frameCount) {
    //, imgcoeftot) {
    /******************************************************************
      /******* read original image for comparison                 *******
      /*****************************************************************/

    var wsscoind = 0;

    var imgcoeftot = 0;
    var imgmot = 0;

    var imgwidth;
    var imgheight;

    var pX;
    var pY;

    var i;
    var j;
    var picarrno = 0

    var pixelorigArray = [];
    var pixelArray = [];

    const config = {
        string: true,
        decimals: 3,
    };

    try {
        await sharp(imgorigname)
            .metadata()
            .then((metadata) => {
                // Calculate the height at which the image should be split
                console.log("\n\nmetadata.height  = " + metadata.height)
                splitHeight = Math.floor(metadata.height / totbox);
                splitWidth = Math.floor(metadata.width / totbox);

            })

        for (i = inbox; i < maxbox; i++) {
            //i = height
            // console.log("\n\n")
            for (j = inbox; j < maxbox; j++) {

                await sharp(imgorigname)
                    .extract({
                        left: parseInt(i * splitWidth), // 0,
                        top: parseInt(j * splitHeight), // 0,
                        width: splitWidth,
                        height: splitHeight,
                    })
                    //   .toFile('./../arcctv-web/public/F' + this.flder + "/orig" + picarrno + parseInt((i * 4) + j) + "_razimg.jpg")

                    //  .grayscale()
                    .raw()
                    .toBuffer({ resolveWithObject: true })
                    .then(({ data, info }) => {
                        pixelorigArray = new Uint8ClampedArray(data.buffer);

                        //  console.log("\n\norig pixelarray[" + parseInt((i * 4) + j) + "] = " + JSON.stringify(pixelorigArray))
                    }); // en for .then

                await sharp(imgname)
                    .extract({
                        left: parseInt(i * splitWidth), // 0,
                        top: parseInt(j * splitHeight), // 0,
                        width: splitWidth,
                        height: splitHeight,
                    })
                    //  .grayscale()
                    .raw()
                    .toBuffer({ resolveWithObject: true })
                    .then(async ({ data, info }) => {
                        pixelArray = new Uint8ClampedArray(data.buffer);

                        // const { width, height, channels } = info;
                        // await sharp(pixelArray, { raw: { width, height, channels } })
                        //     .toFile('my-changed-image.jpg');

                        imgcoeftot = correlationCoefficient(pixelorigArray, pixelArray);
                        //raz imgcoeftot = correlationCoefficient(imgorigname, imgname);

                        //  console.log("fghfhdCorrelation Coefficient: " + imgcoeftot);
                      //  console.log("\n\ncorr = " + imgcoeftot)

                        if ((imgcoeftot >= imgcoemin  && imgcoeftot <= imgcoemax ) || isNaN(imgcoeftot)) {
                            imgmot = parseInt(imgmot + 1);
                        }

                        // console.log("wsscoind = " + wsscoind)

                        wsscoind = wsscoind + 1;


                    }); // en for .then
                // } catch (err) {
                //     console.log("\n\ncannot extract  pic")
                //  }
            } // end of j8.8

            console.log("\n\nimgmot = " + imgmot + "       frme = #" + frameCount)
            wssmot = imgmot
            return imgmot;

        } // end for i
    } catch (err) {
        console.log("\n\ncannot extract  pic")
    }

} // end of getimage  

function correlationCoefficient(X, Y) {
    //   console.log("\n\ndoing correlation coeficient ... mot =  " + " \n\n");
    try {

        if (X.length >= Y.length) {
            var n = Y.length;
        } else {
            var n = X.length;
        }

        //const n = X.length;
        let sum_X = 0;
        let sum_Y = 0;
        let sum_XY = 0;
        let squareSum_X = 0;
        let squareSum_Y = 0;

        for (let i = 0; i < n; i++) {
            sum_X += X[i];
            sum_Y += Y[i];
            sum_XY += X[i] * Y[i];
            squareSum_X += X[i] * X[i];
            squareSum_Y += Y[i] * Y[i];
        }

        const numerator = n * sum_XY - sum_X * sum_Y;
        const denominator = Math.sqrt((n * squareSum_X - sum_X * sum_X) * (n * squareSum_Y - sum_Y * sum_Y));

        //   if (denominator === 0) {
        //      return 0; // Or handle as a specific case (e.g., perfect correlation if one variable is constant)
        //   }
        //
        //   console.log("\n\ndemonitor = " + denominator.toFixed(3) + "    numerator = " + numerator.toFixed(3) + " = " + (numerator / denominator).toFixed(3))

        return (numerator.toFixed(3) / denominator.toFixed(3)).toFixed(3);

    } catch {
        console.log("\n\nat correlation..")
    }
}

async function update_motion(clientdet, imgorigname, imgname, clientcd, imglocpic, imgmot, corrind,) {
    console.log("\n\ndoing update miotion... mot = " + clientcd + " \n\n");
    try {
        if (imgmot > Number(minmdt) && imgmot < Number(maxmdt)) {
            console.log("\n\nrename to motion detect......." + sendimgind);

            /*******************************************************
            * ******  check if dayu folder exist if not mk dir    *
            * ************************************************** */

            if (!fs.existsSync(clientcd + datefmt.format(new Date(), "DDMMYYYY"))) {
                fs.mkdirSync(clientcd + datefmt.format(new Date(), "DDMMYYYY"));
            } // end for date folder

            /*******************************************************
            * ******  store imagfe motion   *
            * ************************************************** */
            try {
                // fs.rename(imgname, clientcd + "/" + datefmt.format(new Date(), "DDMMYYYY") +
                //     "/" + datefmt.format(new Date(), "DDMMYYYY HHMMSS") + "- " +
                //     imgmot + ".jpg", function (err) {
                //         if (err)
                //             console.log(
                //                 "ERROR: raz at 7" + err + "     " + imgname + " - " + imgorigname
                //             );
                //         //  exit()
                //     }
                // );
                fs.writeFile(clientcd + "/" + datefmt.format(new Date(), "DDMMYYYY") +
                    "/" + datefmt.format(new Date(), "DDMMYYYY-HHMMSS") + "-" +
                    imgmot + ".jpg", imgname, (err) => {
                        if (err) {
                            console.error(`\n\n[${clientdet.vidcam}] Save failed:`, err);
                        } else {
                            console.log(`\n\n[${wsslocpic + "_orig.jpg"}] Saved frame successfully -> ${wsslocpic}`);
                        }
                    })

                if (sendimgind == "n") {
                    sendimgind = "y"
                }

console.log("\n\nclientdet = " + JSON.stringify(clientdet) + "\n\n")

                getRegistrationTokenFromDatabase(clientdet.vidclcode); // Implement this function to retrieve the token from your database 

            } catch {
                console.log("\n\nrename image to date and time")
            }
        } else {
            /*******************************************************
            * ******  if orig image exist delete (unlink) orig image*
            * ************************************************** */
            console.log("\n\nrename to orig and delete image.......")
            try {
                if (sendimgind == "y") {
                    sendimgind = "n"
                }
                imgorigname = imgname
                imgname = null
            } catch (er) {
                console.log("\n\nerror at delete orig andm rename piv")
            }

            console.log("\n\nend of update modtion")

        } // end of compare for difference
        return imgorigname;
    } catch {//      console.log("at update motionh error \n\n");
    }
}

async function getRegistrationTokenFromDatabase(clncode) {
    console.log("\n\nFetching registration token from database..." + clncode + "\n\n");
    try {
        // Implement your logic to fetch tokens from the database
        // For example, if you're using MongoDB:
        const dbname = require("./dbmodels/clientdb")

        await dbname.find({ clcode: clncode })
            .then(async function (fcmdata) {
                //  if (!fcmdata || fcmdata.length === 0) {
               // console.log("No tokens found for the specified client code.");
                //   return null; // Return null or an empty array if no tokens are found
                //   }
                console.log("\n\nFetched tokens from database:" + fcmdata[0].clandtoken);
                //registerToken = fcmdata[0].clandtoken
                // return  fcmdata[0].clandtoken; // Return the list of tokens for logging

                fcmdata[0].clandtoken.forEach((andtoken) => {
                    console.log("\n\nSending notification to token: " + andtoken);

                    sendNotificationToAndroid(fcmdata[0].clandtoken, "Testing of notification", " This is a test notification sent from Node.js to Android device using Firebase Cloud Messaging (FCM).");
                })
            }) // end of filedb.find
            .catch((error) => {
                console.error("Error fetching tokens from database:", error);
                return null; // Return null or an empty array in case of an error
            });
    } catch (error) {
        console.error('Error fetching registration token:', error);
        return null; // Return null or an empty array in case of an error
    }
}

async function sendNotificationToAndroid(registrationToken, title, body) {
    console.log("\n\nSending notification to Android...  " + registrationToken + "\n\n");
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            token: registrationToken,
        };

        await admin.messaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}




