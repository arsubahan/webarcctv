var mongoose = require('mongoose');

var cllocpubSchema = mongoose.Schema({

    locpubclcode: {
        type: String,
        unique: true
    },
    locdesco : {
        type: String
    }

})

var cllocpubdb = mongoose.model('flcllocpubmongos', cllocpubSchema);
module.exports = cllocpubdb;;
