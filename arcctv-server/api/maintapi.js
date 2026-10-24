const express = require("express"),
    session = require("express-session"),
    app = express(),
    cors = require("cors"),
    requestIp = require("request-ip"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    bcrypt = require("bcrypt"),
    { errorMonitor } = require("events"),
    jwt = require("jsonwebtoken"),
    crypto = require('crypto'),

    net = require('net'),
    WebSocket = require('ws'),
    path = require("path"),
    killport = require('kill-port'),
    // port = process.env.PORT || 3200,

    { detect } = require('detect-port'),
    { exec } = require('child_process'),

    fs = require("fs"),
    ffmpeg = require("fluent-ffmpeg"),
    ffmpegPath = require("ffmpeg-static"),
    extractFrames = require("ffmpeg-extract-frames"),
    Stream = require("node-rtsp-stream"),

    onvif = require("node-onvif"),
    sharp = require("sharp"),

    getPixels = require("get-pixels"),
    imageSize = require("image-size"),

    datefmt = require('date-and-time'),
    nodemailer = require("nodemailer");
ffmpeg.setFfmpegPath(ffmpegPath);

const { spawn } = require('child_process');

const maintrouter = express.Router();

const {
    createWebSocketServer,
    getWebSocketServer,
    createCameraSocket,
    getCameraSocket
} = require('./arwebsocket');


maintrouter.post("/getfile", async (req, res) => {
    try {
        console.log("req.body = " + JSON.stringify(req.body));
        const dbname = require("../dbmodels/" + req.body.fltyp);

        const dbdet = await dbname.find({});
        res.send(dbdet);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//get only folders
maintrouter.post("/getflname", async (req, res) => {

    //path3 = path.resolve("req.body.flder", "c1");
    //const dbname = require("../dbmodels/chapterdb");
    console.log("\n\ngetflname req.body = " + JSON.stringify(req.body.fltyp) + "\n\n");
    var cont = 'y'
    //   try {
    //     var filenm = await fs.readdirSync(req.body.fltyp);
    // } catch (err) {
    //     cont = 'n'
    //     console.error(err);
    //     res.status(500).send(err);
    // }
    console.log("\n\nreq.body.fldirtype = " + req.body.fldirtype + "\n\n")

    if (req.body.fldirtype == "D") {
        const getDirectories = (source) =>
            fs.readdirSync(source, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
        const filenm = getDirectories(req.body.fltyp);
        res.json(filenm);
    } else if (req.body.fldirtype == "F") {
        const getDirectories = (source) =>
            fs.readdirSync(source, { withFileTypes: true })
                .filter(dirent => dirent.isFile())
                .map(dirent => dirent.name);
        const filenm = getDirectories(req.body.fltyp);
        res.json(filenm);
    }



    //  console.log("\n\nfilenmlates = " + JSON.stringify(filenm) + "\n\n")



    // }


    //console.log("count file = " + JSON.stringify(Jdata));


});

//get lit with criteria
maintrouter.post("/getfilecrit", async (req, res, next) => {
    try {
        console.log("\n\nreq.body = " + JSON.stringify(req.body.txtsrch));

        // req.body.txtsrch = { picdate: "E20230310" };
        //   console.log(' \ngetfilecrit req.body.txtsrch = ' + JSON.stringify(req.body.txtsrch))

        var wssothers = {};
        if (req.body.txtsrch != undefined) {
            for (var key in req.body.txtsrch) {
                // if (crit == "" ){
                //  console.log("\nkey = " + key + "\n")
                if (key != "$or" && key != "$and") {
                    req.body.txtsrch[key] = {
                        $regex: req.body.txtsrch[key],
                        $options: "i",
                    };
                    console.log(
                        "\n\nreq.body.txtsrch dcf[" +
                        key +
                        "] = " +
                        JSON.stringify(req.body.txtsrch[key])
                    );
                    // crit = key +  ":" + "/" + txtsrch[key] + "/i"
                    // } else {
                    //   crit = crit + "," + key +  ":" + "/" + txtsrch[key] + "/i"
                    // crit =  JSON.parse( crit)
                }
            }
            console.log("\nreq.body..." + JSON.stringify(req.body.txtsrch));

            const dbname = require("../dbmodels/" + req.body.fltyp);
            const wsscrit = req.body.txtsrch;
            try {
                const dbdet = await dbname.find(wsscrit)
                //.sort({ date: -1});
                res.send(dbdet);
            } catch (err) {
                console.error(err);
                res.status(500).send(err);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//create item
maintrouter.post("/createrecord", async (req, res) => {

    try {
        var databody;

        const dbname = require("../dbmodels/" + req.body.fltyp);
        reccount = Object.keys(req.body.data).length;
        // console.log("\nreccount = " + reccount  + "\n")
        wsscol = [];
        obj = {};
        //dCol;
        //dRow;
        //wssplit;

        var newmemb = new dbname();

        console.log("\n\nreq.body = " + JSON.stringify(req.body) + "\n\n")

        for (var key in req.body.data) {
            dCol = req.body.data[key];
            dRow = key;
            console.log("dRow = " + typeof dCol + "\n\n")
            // // console.log("      ")
            console.log("search dol = " + JSON.stringify(dCol) + "\n\n");

            console.log("dRow = " + JSON.stringify(dRow) + "\n\n")

            if (dCol != null && typeof dCol == "number") {
                // wssplit = dCol.split("'");
                //    console.log('newmemb brfore[' + dRow + '] = ' + parseInt(dCol))
                dCol = parseInt(dCol);
                newmemb[dRow] = dCol;
                //    console.log('newmemb[' + dRow + '] = ' + newmemb[dRow])
            } else if (dCol != null && dCol.includes("encryptPassword")) {
                //  console.log("dCol before split = " + dCol)
                wssplit = dCol.split("'");
                console.log("key = " + key + "     Object.keys(key) = " + JSON.stringify(wssplit[1]));
                newmemb[dRow] = newmemb.encryptPassword(wssplit[1]);

            } else if (dCol != null && typeof dRow == "content") {
                console.log("\n\n\ dCol = " + JSON.stringify(dCol) + "         dRow  = " + JSON.stringify(dRow))
            } else {
                newmemb[dRow] = dCol;
            }
            console.log("dcol = " + dCol + "      rowm = " + [dRow]);
            console.log("key = " + key + "     newmwmb = " + JSON.stringify(newmemb));
        }

        newmemb
            .save({ returnDocument: 'after' })
            .then((result) => {
                console.log("\n\nraz result - " + JSON.stringify(result))
                res.status(201).json({
                    message: "User created",
                    result: result,
                });
                // alert(
                //   "Member  created with member COde - " +
                //   req.body.UsStaffcd -
                //   req.body.UsStaffname
                // );
            })
            .catch((err) => {
                console.log("\n\nraz err s=careting " + err)
                res.status(500).send(err);
            });

    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//update record
maintrouter.put("/updrecord/:id", async (req, res) => {
    console.log("\n\ndoing updrecord   =  " + JSON.stringify(req.body))

    try {
        const id = req.params._id;

        console.log(
            "\n\nreq body before saving at updrec =" +
            JSON.stringify(req.body) +
            "   req.params.id  = " +
            req.params._id +
            "\n\n"
        );

        filedb = require(path.resolve("./dbmodels") + "/" + req.body.fltyp);

        const flupdb = await filedb.findByIdAndUpdate(
            { _id: req.body.data._id },
            req.body.data,
            { returnDocument: 'after' }
        );
        console.log("\n\nflupdb at 126 = " + flupdb);
        res.send(flupdb);

    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//signup username and pasword
maintrouter.post("/signup", (req, res) => {

    console.log("\n\nreq.body = " + JSON.stringify(req.body.data))
    try {
        var dbname = require("../dbmodels/" + req.body.fltyp);

        var hashpassword = '';
        if (req.body.data.cltype == 'C') {
            hashpassword = req.body.data.clpassword
            console.log("\n\n hashpassword C (" + req.body.data.clpassword + ") = " + hashpassword)

        } else {
            hashpassword = req.body.data.UsPassword
            console.log("\n\n hashpassword A (" + req.body.data.UsPassword + ") = " + hashpassword)

        }

        bcrypt.hash(hashpassword, 10).then((hash) => {
            hashpassword = hash;

            if (req.body.data.cltype == 'C') {
                req.body.data.clpassword = hashpassword
            } else {
                req.body.data.UsPassword = hashpassword
            }

            const userModel = new dbname(req.body.data);

            userModel
                .save({ returnDocument: 'after' })
                .then((result) => {
                    res.status(201).json({
                        message: "User created",
                        result: result
                    });
                    // alert(
                    //   "Member  created with member COde - " +
                    //   req.body.UsStaffcd -
                    //   req.body.UsStaffname
                    // );
                })
                .catch((err) => {
                    // res.status(500).send(err);
                });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

maintrouter.post("/login", async (req, res) => {

    // console.log("\n\nreqbosy = " + JSON.stringify(req.body))
    try {
        var dbname = require("../dbmodels/" + req.body.fltyp);
        var userFound;
        var crit

        if (req.body.type == "A") {
            crit = { UsStaffcd: req.body.authData.UsStaffcd }
        } else {
            crit = { clcode: req.body.authData.clcode }
        }
        //   console.log("\n\ncrit = " + JSON.stringify(crit))
        await dbname
            .findOne(crit)
            .then((user) => {

                //          console.log("\n\nuser = " + user)

                if (!user) {
                    if (req.body.type == "A") {
                        return res.status(401).send({
                            message: "Staff  Code invalid ",
                        }); // end of if usesr
                    } else {
                        return res.status(401).send({
                            message: "Client Code Invalid..",
                        }); // end of if usesr

                    }
                }

                userFound = user;

                if (req.body.type == "A") {
                    return bcrypt.compare(req.body.authData.UsPassword, user.UsPassword);
                } else {
                    //               console.log("\n\nreq.body.authData.Uspassword = " + req.body.authData.clpassword + "      ")
                    return bcrypt.compare(req.body.authData.clpassword, user.clpassword);
                }


            }) // end of check if user !ok
            .then((result) => {
                if (!result) {
                    return res.status(401).send({
                        message: "Password is incorrect",
                    });

                    userFound = {};
                }

                //           console.log("\n\nlogin userFound result = " + JSON.stringify(userFound));



                if (userFound) {

                    var cladmintype = {};
                    if (req.body.type == "A") {
                        cladmintype = {
                            userid: userFound.UsStaffcd,
                            username: userFound.UsStaffname,
                            userId: userFound._id,
                        }
                    } else {
                        cladmintype = {
                            userid: userFound.clcode,
                            username: userFound.clname,
                            userId: userFound._id,
                        }
                    }

                    const token = jwt.sign(
                        cladmintype,
                        "secret_string",
                        { expiresIn: "1h" }
                    );
                    if (req.body.type == "A") {
                        return res.status(200).json({
                            token: token,
                            expiresIn: 3600,
                            userid: userFound.UsStaffcd,
                            username: userFound.UsStaffname,
                            // userlevel: userFound.Uslevel,
                        });
                    } else {
                        if (req.body.type == "C") {
                            var retdata = {
                                token: token,
                                expiresIn: 3600,
                                userid: userFound.clcode,
                                username: userFound.clname,
                                // userlevel: userFound.Uslevel,
                            }
                        } else {
                            var retdata = {
                                token: token,
                                expiresIn: 3600,
                                userid: userFound.clcode,
                                username: userFound.clname,
                                wvind: true,
                            }
                        }

                        return res.status(200).json(retdata);

                    }
                } //end ofusername and passwoird ok
            }); // end for dbfindone
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }

}); // end of checking  staff code

maintrouter.put("/delrecord/:id", async (req, res) => {

    try {
        const id = req.params._id;

        // console.log(
        //   "\n\nreq body before saving at updrec =" +
        //     JSON.stringify(req.body.data) +
        //     "   req.params.id  = " +
        //     req.body.data._id +
        //     "\n\n"
        // );

        filedb = require(path.resolve("./dbmodels") + "/" + req.body.fltyp);

        /*=============================================
        ***   this is added for criteria            ***
        =============================================*/
        // var wssothers = {};
        // if (req.body.txtsrch != undefined) {
        //     for (var key in req.body.txtsrch) {
        //         // if (crit == "" ){
        //         //  console.log("\nkey = " + key + "\n")
        //         if (key != "$or" && key != "$and") {
        //             req.body.txtsrch[key] = {
        //                 $regex: req.body.txtsrch[key],
        //                 $options: "i",
        //             };
        //             console.log(
        //                 "\n\nreq.body.txtsrch dcf[" +
        //                 key +
        //                 "] = " +
        //                 JSON.stringify(req.body.txtsrch[key])
        //             );
        //             // crit = key +  ":" + "/" + txtsrch[key] + "/i"
        //             // } else {
        //             //   crit = crit + "," + key +  ":" + "/" + txtsrch[key] + "/i"
        //             // crit =  JSON.parse( crit)
        //         }
        //     }
        //     console.log("\nreq.body..." + JSON.stringify(req.body.txtsrch));

        //     const dbname = require("../dbmodels/" + req.body.fltyp);
        //     const wsscrit = req.body.txtsrch;
        //     try {
        //         const dbdet = await dbname.deleteMany(wsscrit)
        //         //.sort({ date: -1});
        //         res.send(dbdet);
        //     } catch (err) {
        //         console.error(err);
        //         res.status(500).send(err);
        //     }
        // } else {

        // end of criteria
        const flupdb = await filedb.findByIdAndDelete(
            { _id: req.body.data._id },
            req.body.data,
            { returnDocument: 'after' }
        );
        // console.log("\n\nflupdb at del = " + flupdb);
        res.send(flupdb);
        //    }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }

});

maintrouter.post("/delcrit", async (req, res) => {

    console.log("\n\ndelet crit req.body = " + JSON.stringify(req.body.txtsrch));

    try {
        var wssothers = {};
        if (req.body.txtsrch != undefined) {
            // for (var key in req.body.txtsrch) {
            //     // if (crit == "" ){
            //       console.log("\nkey = " + key + "      typeof key = " + typeof key + "\n")


            //     if (key != "$or" && key != "$and" &&  typeof key != "number" ) {
            //         req.body.txtsrch[key] = {
            //             $regex: req.body.txtsrch[key],
            //             $options: "i",
            //         };
            //         console.log(
            //             "\n\nreq.body.txtsrch dcf[" +
            //             key +
            //             "] = " +
            //             JSON.stringify(req.body.txtsrch[key])
            //         );
            //         // crit = key +  ":" + "/" + txtsrch[key] + "/i"
            //         // } else {
            //         //   crit = crit + "," + key +  ":" + "/" + txtsrch[key] + "/i"
            //         // crit =  JSON.parse( crit)
            //     }
            // }
            console.log("\nreq.body..." + JSON.stringify(req.body.txtsrch));

            const dbname = require("../dbmodels/" + req.body.fltyp);
            const wsscrit = req.body.txtsrch;
            try {
                const dbdet = await dbname.deleteMany(wsscrit)
                //.sort({ date: -1});
                res.send(dbdet);
            } catch (err) {
                console.error(err);
                res.status(500).send(err);
            }

        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }

});

maintrouter.post('/forgot', async function (req, res, next) {
    console.log("doing post forgot admin" + JSON.stringify(req.body));
    // if (req.body[1] == "Admin") {
    //   //     console.log("req.body[0] admin = " + JSON.stringify(req.body[0]) + "     user =  " + JSON.stringify(User));
    //   var User = require('./../dbmodels/Administrator');
    // } else {
    //   //   console.log("req.body[0] cust = " + JSON.stringify(req.body[0]) + "     user =  " + JSON.stringify(User));
    //   var User = require('./../dbmodels/memberfl');
    // }.

    crit = { UsStaffcd: req.body.data.txtmembercd }
    try {
        console.log("\n\n ueq.body.txtmembercd  = " + req.body.data.txtmembercd)

        filedb = require(path.resolve("./dbmodels") + "/" + req.body.fltyp);
        await filedb
            .findOne(crit)
            .then((user) => {
                console.log("\n\n user from findone txtmemcd = " + JSON.stringify(user) + "    crti = " + JSON.stringify(crit))
                if (user) {
                    crypto.randomBytes(20, function (err, buf) {
                        var token = buf.toString('hex');

                        //   console.log("\n\ntoken = " + token);
                        // res.send(token);

                        // console.log("\n\ndate = " + Date.now());

                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        //  console.log("\n\nuser from      user = " + user + "         _id = " + user._id)
                        // const flupdb = filedb.findByIdAndUpdate(
                        //   { _id: user._id },
                        //   user,
                        //   { returnDocument: 'after' }
                        // );

                        console.log("user fuund  token = " + token + "     user = " + user)
                        res.send({ token: token, user: user });

                    }); // ecnd of crypto
                } else {
                    //   console.log("user not fuund" + "  err = " + err);
                    req.session.errors = [{ "param": "email", "msg": "No account with that email address exists.", "value": "" }]
                    //  req.flash('errors', 'No account with that email address exists.');
                    //return 
                    //res.send(err, user);
                    return res.send("nok");

                }  //if ! user
            });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


maintrouter.post("/getstream", async (req, res) => {
    console.log("\n\ngetstream req.body = " + JSON.stringify(req.body) + "\n\n")

    let port = Number(req.body.vidptno);

    let wsskt = getWebSocketServer();
    //    let wsscam = createCameraSocket("cam0", Number(req.body.vidptno));


    if (!wsskt) {
        wsskt = createWebSocketServer(port);
    }

    console.log("\n\ngt sockert  = " + JSON.stringify(wsskt) + "\n\n\n")

    rtspadd = "rtsp://" + req.body.data.viduserid + req.body.data.vidpassword + "@" + req.body.data.vidip + ":" + req.body.data.vidlocpub


    // FFmpeg arguments optimized to decode once and drop extra frames on arrival
    const ffmpegArgs = [
        '-rtsp_transport', 'tcp',        // Optional: force TCP for RTSP stability
        '-i', rtspadd,  // Replace with your input (e.g., webcam: "-i", "/dev/video0")
        '-f', 'mpegts',                  // Format required for sequential streaming (MPEG-TS)
        '-codec:v', 'mpeg1video',        // Video codec (ideal for jsmpeg player)
        '-vf', 'fps=25,scale=640:480',                // Resolution
        '-b:v', '1000k',                 // Video bitrate
        '-bf', '0',                      // Remove B-frames to reduce latency
        //'-codec:a', 'mp2',               // Audio codec (ideal for jsmpeg)
        // '-ar', '44100',                  // Audio sampling rate
        // '-ac', '1',                      // Audio channels
        // '-b:a', '128k',                  // Audio bitrate
        'pipe:1'                         // Directs FFmpeg output to stdout stream
    ];

    // 3. Spawn the FFmpeg child process
    ffmpegarcctv = spawn('ffmpeg', ffmpegArgs);

    // FFmpeg video data
    ffmpegarcctv.stdout.on('data', (chunk) => {

        //  console.log('FFmpeg chunk:', chunk.length);
        if (wsskt && wsskt.clients) {

            wsskt.clients.forEach((client) => {

                if (client.readyState === WebSocket.OPEN) {
                    client.send(chunk, { binary: true });
                }

            });
        }

    });

    ffmpegarcctv.stderr.on('data', (data) => {
        //console.log('FFmpeg:', data.toString());
    });

    ffmpegarcctv.on('close', (code) => {
        wsskt.clients = null
        console.log('FFmpeg exited:', code);
    });

    // SEND HTTP RESPONSE ONLY ONCE
    res.status(200).json({
        success: true,
        message: 'Streaming started'
    });


    //  })

});








// let wsskt;
// let ffmpegarcctv;
// //  var newsocket;

// // if (req.body.modetype == "close") {
// //     stopStream(newsocket)
// //     return res.send({ message: "Stream closed" });
// // }kt

// // await isPortAvailable(Number(req.body.vidptno)).then(async isAvailable => {
// //     if (isAvailable) {

// //         console.log("\n\nport " + req.body.vidptno + " is available, creating WebSocket server...\n\n");
// //         wsskt = new WebSocket.Server(
// //             {
// //                 port: Number(req.body.vidptno)
// //                 //   path: '/ws/' + req.body.data.vidclcode + "/" + req.body.data.vidloc,
// //             });
// //     }
// //     else {
// //         console.log("\n\nport " + req.body.vidptno + " is occupied, creating WebSocket server without port...\n\n");
// //         // wsskt = WebSocket.Server(
// //         //     {
// //         //           port: Number(req.body.vidptno),
// //         //         path: '/ws/' + req.body.data.vidclcode + "/" + req.body.data.vidloc,
// //         //     });
// //     }
// // })

// const available = await isPortAvailable(Number(req.body.vidptno));

// if (available) {

//     console.log("Creating WebSocket server");

//     wsskt = new WebSocket.Server({
//         port: Number(req.body.vidptno)
//     });

// } else {

//     console.log("Port " + req.body.vidptno + " is already used, reusing existing websocket");
// }

// console.log("Creating WebSocket server on port", Number(req.body.vidptno));



// wsskt.on("listening", () => {
//     console.log("WebSocket server listening on", Number(req.body.vidptno));


//     console.log("\n\sskt = " + '/ws/' + req.body.data.vidclcode + "/" + req.body.data.vidloc)
//     cameraId = "/ws/" + req.body.data.vidclcode + "-" + req.body.data.vidloc
//     // wsskt.on('connection', (ws) => {
//     console.log('\n\nWebSocket connected' + JSON.stringify(wsskt) + '    \n\n');

//     //     ws.on('close', () => {
//     //         console.log('WebSocket disconnected');
//     //     });
//     // });


//     console.log("\n\nrtsp://" + req.body.data.viduserid + req.body.data.vidpassword + "@" + req.body.data.vidip + ":" + req.body.data.vidlocpub)

//     rtspadd = "rtsp://" + req.body.data.viduserid + req.body.data.vidpassword + "@" + req.body.data.vidip + ":" + req.body.data.vidlocpub

//     const streams = {};

//     // function createStream(cameraId, rtspadd) {

//     if (streams[cameraId]) {
//         console.log("Stream already running");
//         return streams[cameraId];
//     }


//     const ffmpeg = spawn("ffmpeg", [
//         "-rtsp_transport", "tcp",
//         "-i", rtspadd,
//         "-f", "mpegts",
//         "-codec:v", "mpeg1video",
//         "-"
//     ]);

//     streams[cameraId] = {
//         ffmpeg: ffmpeg,
//         clients: []
//     };


//     ffmpeg.stdout.on("data", (chunk) => {

//         streams[cameraId].clients.forEach(client => {

//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(chunk);
//             }

//         });

//     });


//     return streams[cameraId];
//     // }

//     wsskt.on("connection", (ws, req) => {

//         console.log("New WebSocket connection established");

//         let cameraId = req.url.split("/").pop();


//         console.log("Camera:", cameraId);


//         let stream = createStream(
//             cameraId,
//             cameraRtsp[cameraId]
//         );


//         stream.clients.push(ws);


//         ws.on("close", () => {

//             stream.clients =
//                 stream.clients.filter(c => c !== ws);


//             console.log("Remaining clients:",
//                 stream.clients.length);


//             // stop ffmpeg if nobody watching
//             if (stream.clients.length === 0) {
//                 stream.ffmpeg.kill("SIGTERM");
//                 delete streams[cameraId];
//             }

//         });


//     });









//})

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

        server.listen(wssport, '0.0.0.0');
    });
}



module.exports = maintrouter;