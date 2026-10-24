var mongoose = require('mongoose');

var configSchema = mongoose.Schema({

    configcode: {
        type: String,
        required: true,
        unique: true
    },
    configdesc : {
        type: String
    },
    configvalue : {
        type: String
    }

})

var configdb = mongoose.model('flconfigmongos', configSchema);
module.exports = configdb;;
