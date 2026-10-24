const express = require("express"),
    session = require("express-session"),
    app = express(),
    cors = require("cors"),
    requestIp = require("request-ip"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    liverouter = express.Router(),

    Websocket = require('ws'),
    path = require("path"),
    port = process.env.PORT || 3200,
    net = require('net'),


    cron = require('node-cron'),


    { detect } = require('detect-port'),
    //  { exec } = require('child_process'),

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

//const { spawn } = require('child_process');
const { exec } = require('child_process');
const command = ' lsof -t -i:8000';

//const db = require("./../db");

//var filedb = require('./../ARcctv-server/dbmodels/clvideodb');
var filedb = require(path.resolve("./dbmodels") + "/clvideodb");

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

let isRunning = false;
let intervalId = null;


liverouter.post("/livestream", async (req, res) => {
    if (isRunning) return;
    console.log("\n\nfrom livestream api.....")

    // server = app.listen(port, async function () {
    //     // var port = server.address().port;
    //     console.log('from raz Listening on port : ' + JSON.stringify(server.address().port));

    // await filedb.find()
    //     .then(async function (fldata) {
    //         await getrec(fldata)
    //         await processimg(fldata)
    //     }) // end of filedb.find  
    startstream();
})


async function startstream() {
    console.log("\n\nstarting live startstream ....")

    var i = 0;
    // setInterval(() => {
    //     let i =+ 1
    //     console.log("Checking for stream updates..." + i);
    // }, 200);

    cron.schedule('* * * * *', async () => {
        i = i + 1
        console.log("Checking for stream updates..." + i);
        await filedb.find()
            .then(async function (fldata) {
                await getrec(fldata)
                await processimg(fldata)
            }) // end of filedb.find   
    })
}

async function getrec(datafl) {
    // try {
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
                    wsslocpic =
                        "./../ARcctv-web/public/clientimg/" +
                        value.vidclcode +
                        "/" +
                        wsslocpic;
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

                    wssrstp = "rtsp://" + value.viduserid + value.vidpassword + "@" + value.vidip + ":" + value.vidlocpub
                    console.log("\n\nstarting ip adres = " + wssrstp + "\n\n")
                    //  try {

                    //  console.log("\n\nvidiup = " + value.vidip + "\n\n")

                    // if (value.vidip != undefined) {
                    await getstream(value, wssrstp, key, "s")
                    await extractpic(wsslocpic, wssrstp, "s")
                    // }
                    //  } catch {
                    //    console.log("streaming error...." + value.vidclcode + "     ip address = " + value.vidip + "\n\n")
                    //  }

                } //nd of  vidcltype != IE
                //  console.log('Port 3000  = ' + isAvailable);

            } else {
                console.log('Port ' + value.vidwsport + ' isn   = ' + isAvailable);
            }
        });
    })// end of fldata.Foreach
    // stremind = 'y'
    // } // end of stremind = n
    //  } catch {
    //      console.log("\n\n when start to stream errror")
    // }

}

async function isPortAvailable(wssport) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false); // Port is occupied
            } else {
                resolve(false); // Other errors (e.g., access denied)
            }
        });

        server.once('listening', () => {
            server.close(() => {
                resolve(true); // Port is free
            });
        });

        server.listen(wssport);
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


async function processimg(dataflimg) {
    /*************************************************
    * get screen shot every second for comaparison
    ************************************************/
    //  try {
    setInterval(function () {
        //  console.log("doing setinterval.....")
        wssmot = 0
        dataflimg.forEach(async function (value, key) {
            //      try {
            wsslocpic = value.vidloc.substring(parseInt(value.vidloc.length - 9)).replace("(", '').replace(")", '');
            wsslocpic = "./../ARcctv-web/public/clientimg/" + value.vidclcode + "/" + wsslocpic
            //  console.log("\n\n set interval wsslocpic  = " + JSON.stringify(wsslocpic) + "\n\n")

            if (value.vidpassword.indexOf(":") < 0) {
                value.vidpassword = ":" + value.vidpassword
            } // end for add : to password

            wssrstp = "rtsp://" + value.viduserid + value.vidpassword + "@" + value.vidip + ":" + value.vidlocpub

            if (!fs.existsSync(wsslocpic + '_orig.jpg') && fs.existsSync(wsslocpic + '.jpg')) {
                fs.rename(wsslocpic + '.jpg', wsslocpic + '_orig.jpg', function (err) {
                    if (err)
                        console.log('ERROR  RENAME: ' + err + "     " + wsslocpic + '.jpg' + " - " + wsslocpic + '_orig.jpg');
                    //  exit()
                });
            }

            await extractpic(wsslocpic, wssrstp, "")

            if (fs.existsSync(wsslocpic + '_orig.jpg') && fs.existsSync(wsslocpic + '.jpg')) {


                //  console.log("\n\ncheck get image " + await getimage(wsslocpic + "_orig.jpg", wsslocpic + ".jpg",  "./../ARcctv-web/public/clientimg/" + value.vidclcode + "/",
                //   value.vidloc.substring(parseInt(value.vidloc.length - 9)).replace("(", '').replace(")", ''), rowno, wsspicind) + "\n\n")

                //  wssmot = await getimage(wsslocpic + "_orig.jpg", wsslocpic + ".jpg", "./../ARcctv-web/public/clientimg/" + value.vidclcode + "/",
                //    value.vidloc.substring(parseInt(value.vidloc.length - 9)).replace("(", '').replace(")", ''), rowno, wsspicind)
                await getimage(wsslocpic + "_orig.jpg", wsslocpic + ".jpg", "./../ARcctv-web/public/clientimg/" + value.vidclcode + "/")

                //  if (wssmot == undefined) {
                console.log("\n\nbefore wssmot = " + wssmot)
                ////    wssmot = 0
                // } else {

                console.log("\n\n dffdhfgh wssmot = " + wssmot + "\n\n")
                //  }


                await update_motion(wsslocpic + "_orig.jpg", wsslocpic + ".jpg", "./../ARcctv-web/public/clientimg/" + value.vidclcode + "/",
                    value.vidloc.substring(parseInt(value.vidloc.length - 9)).replace("(", '').replace(")", ''), wssmot, wsscorrind)
                // , wssmot, wsscoeftot)
            }


            //     } catch {
            //        console.log("setinterval catch image not found....")
            //     }

        }) // end for each data
    }, 3000);  // end of setInterval
    // } catch {
    //     console.log("\n\nerror in interval")
    // }

}

async function getstream(videtail, rstpadd, wsskey, wsstype) {
    lifestream = [];

    console.log("\n\ndoing getstream - rstpadd = " + rstpadd + "\n\n")

    /*************************************************
     * Streming llve
     ************************************************/
    wsscam = videtail.vidloc
    // var wsscamno = 0
    wsskey = wsskey + 1
    console.log("\n\nwsskey = " + wsskey)

    //  try {
    console.log("\n\nvidetail.vidwsport = " + videtail.vidwsport)

    // if(app.listen())
    if (wsstype == "s") {
        const handler = (rstpadd) => {
            return proxy({
                additionalFlags: ['-q', '1'],  // Reduce quality for lower bandwidth
                url: rstpadd,
                transport: 'tcp',             // Use TCP for stream transport
                verbose: true,                // Print FFmpeg logs
            });
        };

        // app.ws('/api/stream/1', proxy({
        //     url: `rtsp://admin:admin@10.0.1.1:554/feed`
        // }));


        app.ws('/api/stream/wsskey', (ws, req) => {
            const url = req.query.rstpadd;      // Get RTSP URL from query parameter
            handler(url)(ws, req);          // Proxy RTSP stream via WebSocket
        });
        // lifestream[wsskey] = new Stream({
        //     name: wsscam,
        //     streamUrl: rstpadd,
        //     wsPort: videtail.vidwsport,
        //     ffmpegOptions: { // options ffmpeg flags
        //         '-stats': '', // an option with no neccessary value uses a blank string
        //         '-r': 25, // options with required values specify the value after the key
        //     }
        // }) //end for stream
    }
    //   } catch {
    //      console.log("from getstream - istreaming error....")
    //      //     //  wssok = ""
    //      //     //  return wssok
    //  }

}

async function extractpic(folderloc, rstpadd, wsstype) {
    // console.log("\n\ndoing extract - " + folderloc + "     rstp = " + rstpadd + "\n\n")
    // try {
    if (wsstype == "s") {
        // console.log("\n\ndoing extract orig...\n\n" + "    rstp = " + folderloc + "\n\n")

        await extractFrames({
            input: rstpadd,
            output: folderloc + "_orig.jpg",
            offsets: [2000],
        }); // end for extract

        wssvidono.push(wsscam);
    } else {
        //   console.log("\n\ndoing extract normal..." + "    rstp = " + folderloc + "\n\n")

        await extractFrames({
            input: rstpadd,
            output: folderloc + ".jpg",
            offsets: [2000],
        }); // end for extractwsspic
    }

    //  } catch {
    //     console.log("from getextract - extract error....")
    // }
}

async function getimage(imgorigname, imgname) {
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

    var pixelorigArray = [];
    var pixelArray = [];

    const config = {
        string: true,
        decimals: 3,
    };


    try {
        var splitHeight;
        var splitWidth;
        await sharp(imgorigname)
            .metadata()
            .then((metadata) => {
                // Calculate the height at which the image should be split
                splitHeight = Math.floor(metadata.height / 40);
                splitWidth = Math.floor(metadata.width / 40);
            })
            .catch((err) => {
                console.error("Error splitting the image:", err);
            });

        for (i = 0; i < 40; i++) {
            //i = height
            // console.log("\n\n")
            for (j = 0; j < 40; j++) {
                //j is width

                //   console.log("\n\n" + i + " *  4 + " + j + " = " + parseInt((i * 4) + j) + "\n\n")

                //   Split the original  image horizontally
                //  var i = 1
                //   var j = 1
                try {
                    await sharp(imgorigname)
                        .extract({
                            left: parseInt(j * splitWidth), // 0,
                            top: parseInt(i * splitHeight), // 0,
                            width: splitWidth,
                            height: splitHeight,
                        })
                        //  .toFile("orig" + parseInt((i * 4) + j) + "_img.jpg");
                        .grayscale()
                        // .raw()
                        .toBuffer({ resolveWithObject: true })
                        .then(({ data, info }) => {
                            pixelorigArray = new Uint8ClampedArray(data.buffer);

                            //  console.log("\n\norig pixelarray[" + parseInt((i * 4) + j) + "] = " + JSON.stringify(pixelorigArray))
                        }); // en for .then
                } catch (err) {
                    console.log("\n\ncannot extract orig pic")
                }

                try {
                    await sharp(imgname)
                        .extract({
                            left: parseInt(j * splitWidth), // 0,
                            top: parseInt(i * splitHeight), // 0,
                            width: splitWidth,
                            height: splitHeight,
                        })
                        .grayscale()
                        //.raw()
                        .toBuffer({ resolveWithObject: true })
                        .then(async ({ data, info }) => {
                            pixelArray = new Uint8ClampedArray(data.buffer);

                            // const { width, height, channels } = info;
                            // await sharp(pixelArray, { raw: { width, height, channels } })
                            //     .toFile('my-changed-image.jpg');

                            imgcoeftot = correlationCoefficient(pixelorigArray, pixelArray);
                            //raz imgcoeftot = correlationCoefficient(imgorigname, imgname);

                            console.log("fghfhdCorrelation Coefficient: " + imgcoeftot);
                            console.log("\n\ncorr = " + imgcoeftot)

                            if ((imgcoeftot >= -0.551 && imgcoeftot <= 0.485) || isNaN(imgcoeftot)) {
                                imgmot = parseInt(imgmot + 1);
                            }

                            console.log("wsscoind = " + wsscoind)

                            wsscoind = wsscoind + 1;


                        }); // en for .then
                } catch (err) {
                    console.log("\n\ncannot extract  pic")
                }
            } // end of j8.8

            console.log("\n\nimgmot = " + i)
            wssmot = imgmot
            return //imgmot;

        } // end for i
    } catch {
        console.log()
    }
} // end of getimage

function correlationCoefficient(X, Y) {
    // console.log("\n\ndoing correlation coeficient ... mot =  \n\n");
    try {

        if (X.length > Y.length) {
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

        if (denominator === 0) {
            return 0; // Or handle as a specific case (e.g., perfect correlation if one variable is constant)
        }

        //   console.log("\n\ndemonitor = " + denominator.toFixed(3) + "    numerator = " + numerator.toFixed(3) + "\n\n")

        return (numerator.toFixed(3) / denominator.toFixed(3)).toFixed(3);

    } catch {
        console.log("\n\nat correlation..")
    }
}

async function update_motion(imgorigname, imgname, clientcd, imglocpic, imgmot, corrind) {
    console.log("\n\ndoing update miotion... mot = " + clientcd + " \n\n");
    try {
        if (imgmot > 13 && imgmot < 24) {
            console.log("\n\nrename to motion detect.......");

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
                fs.rename(
                    imgname,
                    clientcd +
                    "/" +
                    datefmt.format(new Date(), "DDMMYYYY") +
                    "/" +
                    datefmt.format(new Date(), "DDMMYYYY HHMMSS") +
                    "- " +
                    imgmot +
                    ".jpg",
                    function (err) {
                        if (err)
                            console.log(
                                "ERROR: " + err + "     " + imgname + " - " + imgorigname
                            );
                        //  exit()
                    }
                );
            } catch {
                console.log("\n\nrename image to date and time")
            }
        } else {
            /*******************************************************
            * ******  if orig image exist delete (unlink) orig image*
            * ************************************************** */
            //   console.log("\n\nrename to orig and delete image.......")
            try {
                if (fs.existsSync(imgorigname && imgmot <= 9)) {
                    fs.unlink(imgorigname, function (err) {
                        if (err) console.log("ERROR  raz : " + err);
                    });
                    // } else {
                    /*******************************************************
                    * ******  rename imag to orig image   *
                    * ************************************************** */

                    if (!fs.existsSync(imgorigname) && fs.existsSync(imgname)) {
                        fs.rename(imgname, imgorigname, function (err) {
                            if (err)
                                console.log(
                                    "ERROR: " + err + "     " + imgname + " - " + imgorigname
                                );
                            //  exit()
                        });
                    }
                }
                if (fs.existsSync(imgname)) {
                    fs.unlink(imgname, function (err) {
                        if (err) console.log("ERROR  raz not orig : " + err);
                    });
                }
            } catch (er) {
                console.log("\n\nerror at delete orig andm rename piv")
            }

            console.log("\n\nend of update modtion")

        } // end of compare for difference
    } catch {
        console.log("at update motionh error \n\n");
    }
}


module.exports = liverouter;

