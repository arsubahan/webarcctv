var mongoose = require('mongoose');

var locSchema = mongoose.Schema({

    loccode: {
        type: String,
           required: true,
        unique: true
    },
    locdesc : {
        type: String
    }

})

var locdb = mongoose.model('fllocmongos', locSchema);
module.exports = locdb;;
