
const express = require('express');
const cors = require('cors');
const evntgalrouter = express.Router();
var fs = require('fs');
const multer = require('multer');
const path = require('path');
const fldpath = ""
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



/*==============================================
  ===== check folder exist or create folder ===
  ===========================================*/
evntgalrouter.post("/getdir", async (req, res, next) => {
  // console.log("\n\nreq body = " + JSON.stringify(req.body) + "\n\n")
  if (!fs.existsSync('../siglap-web/public/images/eventgallery/' + req.body.fldname)) {
    fs.mkdirSync('../siglap-web/public/images/eventgallery/' + req.body.fldname);
  } // end for date folder
});

/*===============================================
  ======    upload file                     =====
  ===============================================
  */
 // Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
 
    const uploadPath = '../siglap-web/public/images/eventgallery/' + req.params.wssflder + "/"
    //file.mimetype.startsWith('../siglap-web/public/images/eventgallery/' + req.params.wssflder + "/")
      // ? 'uploads/images'
      // : file.mimetype.startsWith('video/')
      // ? 'uploads/videos'
      // : 'uploads/others';

    // Ensure the directory exists
   // ensureDirectoryExists(uploadPath);
 //           cb(null, '../siglap-web/public/images/eventgallery/' + req.params.wssflder + "/")
          cb(null, uploadPath )


    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

// var storage = multer.diskStorage({

//   destination: function (req, file, cb) {
//     cb(null, '../siglap-web/public/images/eventgallery/' + req.params.wssflder + "/")

//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
//});

var upload = multer({ storage: storage });

evntgalrouter.post("/file", upload.single("file"), (req, res, next) => {
  const file = req.file;
  console.log("\n\nreq.files single = " + JSON.stringify(req.file) + "\n\n")
  if (file) {
    res.json(req.file);
  } else throw "error";
});

evntgalrouter.post("/multiplefiles/:wssflder", upload.array('files'), async (req, res) => {

  //   const files = req.files;
  //   console.log("\n\nreq.params = " + JSON.stringify(req.params.wssflder) + "\n\n")
  //   console.log("\n\nArray.isArray(files) = " + Array.isArray(files) + "      files.length = " + files.length + "\n\n")
  //   if (Array.isArray(files) && files.length > 0) {
  //     res.json(req.files);
  //   } else {
  //     res.status(400);
  //     throw new Error("No file");
  //   }
  // });

  const files = req.files;
  this.fldpath = req.params.wssflder;
  // console.log("\n\n wssfld = " + wssfld)

  console.log("\n\nreq.params = " + JSON.stringify(req.params))

  const uploadPromises = files.map((file) => {

    return new Promise((resolve, reject) => {

    });
  });

  const results = await Promise.all(uploadPromises);
  res.json({
    message: 'Files uploaded succesfully.',
    files: results
  });
})

evntgalrouter.post("/getevnt", (req, res, next) => {
  //console.log("\n\ngetevnt req.body = " + JSON.stringify(req.body.wsscrit))

  filedb = require(path.resolve("./dbmodels") + "/" + req.body.fltyp);
  var crit = req.body.wsscrit;
  filedb.aggregate([
    {
      $match: crit
    }
  ], function (err, result) {
    if (err) console.error;
    // console.log("result = " + JSON.stringify(result));
    res.send(result);
  });


})

module.exports = evntgalrouter;

