const express = require("express"),
    session = require("express-session"),
    app = express(),
    cors = require("cors"),
    requestIp = require("request-ip"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),

    Websocket = require('ws'),
    path = require("path"),
    port = process.env.PORT || 3250,
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

const db = require("./db");


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

/// Configure CORS options
const corsOptions = {
  origin: '*' , // 'https://your-frontend-domain.com', // Avoid using '*' in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure PUT is included
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// BodyParser Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
})



app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("arcctv-web1436946140videostream"));

//  Routes set up
var //router = express.Router(),
    appfilefolder = require("./api/filesfolderapi"),
    appmaint = require("./api/maintapi");
//applivestr = require("./api/livestream");
// appmailer = require("./api/mailerapi");


// Register the routing
app.use("/", appfilefolder);
app.use("/", appmaint);
//app.use("/", applivestr);
//app.use("/",appmailer);

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

/*====================================================
****        receive token from android pone     ******
=====================================================*/
// This route triggers when Android sends data via POST
app.post('/api/getdata', async (req, res) => {
    const andclcode = req.body.clcode.toUpperCase();
    const andcltoken = req.body.clToken

     console.log("Triggered! Data received from Android clcode:", andclcode + "        token = " + andcltoken);

    // Perform backend tasks here (e.g., save to database, emit alerts)
    const dbname = require("./dbmodels/clientdb");
    const wsscrit = { clcode: andclcode.toUpperCase() };
    // try {
    const dbdet = await dbname.find(wsscrit)

      console.log("\n\ndbdet after fine  = " + JSON.stringify(dbdet[0].clandtoken) + "\n\n")


    dbdet[0].clandtoken =  andcltoken

   
    const flupdb = await dbname.findByIdAndUpdate(
        { _id: dbdet[0]._id },
        dbdet[0],
        { returnDocument: 'after' }
    );

    console.log("\n\n flupdb  = " + JSON.stringify(flupdb))

    // Respond back to Android to acknowledge receipt
    res.status(200).json({
        status: "success",
        message: "Node.js successfully triggered!"
    });
});


var filedb = require('./dbmodels/clvideodb');
const killPort = require("kill-port");


/*======================================================
*******       credential of notification android     ***
========================================================*/
console.log("\n\nstarting notification to android....\n\n")

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}


//process.env.GOOGLE_APPLICATION_CREDENTIALS;

 //admin = require("firebase-admin");

//var serviceAccount = require("./arazcctv-b4fa6-firebase-adminsdk-fbsvc-8110a4cddd.json");

/*admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://arcctvapp-953b2-default-rtdb.firebaseio.com"
});
*/

// const serviceAccount = require("./arcctvapp-953b2-firebase-adminsdk-fbsvc-9645edbe51.json");
// const { send } = require("process");
// const tokenarray = []

// // raz Initialize the Firebase Admin SDK
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://arcctvapp-953b2-default-rtdb.firebaseio.com"
// });



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

process.on('uncaughtException', async (error, origin) => {

    console.log("\n\nerr uncaughtException = " + error + "      origin = " + origin)

    await isPortAvailable(port).then(async isAvailable => {
        if (isAvailable) {
            server = app.listen(port, '0.0.0.0', async function () {
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
//startstream();
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
      //  startstream();
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
    //startstream();
    //const retoken = await getTokensAndSendNotification();

    // console.log('Retoken = ' + JSON.stringify(retoken[0].clandtoken));

})

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
                .then(() => console.log('Port 3000 has been cleared.'))
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



