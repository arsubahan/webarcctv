//connect to mongodb
const mongoose = require('mongoose');
const databaseName = 'videomongo';

const dbstrconnect = mongoose.connect("mongodb://localhost/" + databaseName)
//const dbstrconnect = mongoose.connect("mongodb://mongo_db:27017/" + databaseName)
    .then(() => {
       // mongoose.set('useFindAndModify', false);
        console.log('Connected to MongoDB')
    })
    .catch(() => {
        console.log('Error connecting to MongoDB');
    })

module.exports = dbstrconnect;