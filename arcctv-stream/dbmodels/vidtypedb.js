var mongoose = require('mongoose');

var cctvtySchema = mongoose.Schema({

    cctvtypecode: {
        type: String,   
        required: true,
        unique: true
    },
    cctvtypedesc : {
        type: String
    }
    /*,
    cctvtypeabb: {
        type: String
    }
*/
})

var cctvtydb = mongoose.model('flvidtypemongos', cctvtySchema);
module.exports = cctvtydb;;
