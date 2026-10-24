var mongoose = require('mongoose');

var videoSchema = mongoose.Schema({

    vidclcode: {
        type: String,
        required: true
    },
    vidcamno: {
        type: Number
    },
    vidcltype: {
        type: String
    },
    vidip: {
        type: String
    },
    vidloc: {
        type: String
    },
    vidlocpub: {
        type: String
    },
    vidwsport: {
        type: String
    },
    viduserid: {
        type: String
    },
    vidpassword: {
        type: String
    }

})


var videodb = mongoose.model('flvideomongos', videoSchema);
videoSchema.index({ vidclcode: 1, vidcamno: 1}, { unique: true })
module.exports = videodb;;
