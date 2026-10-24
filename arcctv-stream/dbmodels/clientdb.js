var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
//var bcrypt = require('bcryptjs');


var clientSchema = mongoose.Schema({

    clcode: {
        type: String,
        required: true,
        unique: true
    },
    cltype:{
        type : String
    },
    clname: {
        type: String
    },

    claddress: {
        type: String
    },

    clcontactno: {
        type: String
    },

    clemail: {
        type: String
    },
    
    cldatereg: {
        type: String
    },

    clpassword: {
        type: String
    },

     clandtoken: [{
        type : String
    }],

    resetPasswordToken : {
        type: String
    }, 
    resetPasswordExpires : {
        type: Date
    }
    

})

clientSchema.plugin(uniqueValidator);

// clientSchema.methods.encryptPassword = function (password) {
//     console.log('encryoted  for client');
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
// }
// clientSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.clpassword);
// };

var clientdb = mongoose.model('flclientmongos', clientSchema);
module.exports = clientdb;;
