var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema

var runnoflSchema = mongoose.Schema({

    runno: {
        type: Number,
        unique: true
    },
    //occupation no
    runlocno: {
        type: Number
    },
    //client no
    runclno: {
        type: Number
    },
    //staff no
    runwsport: {
        type: Number
    },
    //enquiry no
    runenqno: {
        type: Number
    },
    rumtrno: {
        type: Number
    },
    //invoice no
    runinvno: {
        type: Number
    },
    //item no - noy use yet
    runcctvtyno: {
        type: Number
    },
    // pest no
    runvidno: {
        type: Number
    },
    //solution no
    runsolno : {
        type : Number
    },

    //duration no
    rundurno : {
        type : Number
    },

    //template no
    runtemplno : {
        type:Number
    },

    //chemical no
    runchemno : {
        type: Number
    },

    //quotation no
    runquono : {
        type : Number
    },
    
    //project no
    runprojno : {
        type : Number
    },

    //schedule no
    runschno : {
        type : Number
    },
    
    //schedule report no
    runstaffno : {
        type : Number
    }
})

var runnofldb = mongoose.model('flrunnomongos', runnoflSchema);
module.exports = runnofldb;
