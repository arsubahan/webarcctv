const express = require("express"),
  session = require("express-session"),
  app = express(),
  maintrouter = express.Router(),
  cors = require("cors"),
  requestIp = require("request-ip"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  crypto = require('crypto'),

  Websocket = require('ws'),
  path = require("path"),
  port = process.env.PORT || 3200,

  { detect } = require('detect-port'),
  //  { exec } = require('child_process'),

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

const { convert } = require('html-to-text');

ffmpeg.setFfmpegPath(ffmpegPath);

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

//get filenames from folder
maintrouter.post("/getflname", async (req, res) => {

  //path3 = path.resolve("req.body.flder", "c1");
  //const dbname = require("../dbmodels/chapterdb");
  console.log("\n\ngetflname req.body = " + JSON.stringify(req.body.fltyp) + "\n\n");
  var cont = 'y'
  try {
    var files = await fs.readdirSync(req.body.fltyp);
  } catch (err) {
    cont = 'n'
    console.error(err);
    res.status(500).send(err);
  }
  if (cont = 'y') {
    var wssno = [];
    var Jdata = [];
    for (let i = 0; i < files.length; i++) {
      wssno[i] = files[i].substring(5, 4);
      if (wssno[i].search(".J") >= 0) {
        //     console.log("doing compa     " + wssno[i].search(".J"));
        wssno[i] = wssno[i].substring(0, wssno[i].search(".J"));
      }
      Jdata.push({ slno: parseInt(wssno[i]), sldesc: files[i].toString() });
      //  console.log("count file = " + wssno[i]);
      // console.log("count file = " + JSON.stringify(files[i].search("Slide"),2))
    }
    res.json(Jdata);

  }


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
      .save({ new: true })
      .then((result) => {
        console.log("\n\nresult - " + JSON.stringify(result))
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
        // res.status(500).send(err);
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
      { new: true }
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
      hashpassword = req.body.UsPassword
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
        .save({ new: true })
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

  console.log("\n\nreqbosy = " + JSON.stringify(req.body))
  try {
    var dbname = require("../dbmodels/" + req.body.fltyp);
    var userFound;
    var crit

    if (req.body.type == "A") {
      crit = { UsStaffcd: req.body.authData.UsStaffcd }
    } else {
      crit = { clcode: req.body.authData.clcode }
    }
    console.log("\n\ncrit = " + JSON.stringify(crit))
    await dbname
      .findOne(crit)
      .then((user) => {

        console.log("\n\nuser = " + user)

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
          console.log("\n\nreq.body.authData.Uspassword = " + req.body.authData.clpassword + "      ")
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

        console.log("\n\nlogin userFound result = " + JSON.stringify(userFound));



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
            return res.status(200).json({
              token: token,
              expiresIn: 3600,
              userid: userFound.clcode,
              username: userFound.clname,
              // userlevel: userFound.Uslevel,
            });

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

    const flupdb = await filedb.findByIdAndDelete(
      { _id: req.body.data._id },
      req.body.data,
      { new: true }
    );
    // console.log("\n\nflupdb at del = " + flupdb);
    res.send(flupdb);
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
            //   { new: true }
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

maintrouter.post('/getstream', function (req, res) {
  console.log("\n\nreq.body = " + JSON.stringify(req.body.data.vidip) + "     req.body.data.vidlocpub = " + req.body.data.vidlocpub + "     req.body.data.vidloc = " + req.body.data.vidloc)
  var rtspadd = req.body.data.vidip + ":" + req.body.data.vidlocpub;
  var newsocket = new Stream({
    name: req.body.data.vidloc,
    streamUrl: rtspadd,
    wsPort: req.body.data.vidwsport,
    ffmpegOptions: { // options ffmpeg flags
      '-stats': '', // an option with no neccessary value uses a blank string
      '-r': 30, // options with required values specify the value after the key
    }
  }) //end for stream

  console.log("\n\nnewsocket = " + JSON.stringify(newsocket))

  res.send(newsocket);
  

  newsocket.wsServer.on('error', function () {
    newsocket.mpeg1Muxer.stream.kill();
  });
})



module.exports = maintrouter;
