//entry point to models
//here we connect to database
const mongoose = require('mongoose'),
    DBURL = process.env.DBURL; //|| 'mongodb://localhost/legzotorna'; //database url is environmental variable or localhost

//this will comes in handy
mongoose.set('debug', false);

//actually connceting to the database
//useNewUrl parser is needed due to latest mongoose verions
//useFindAndModify is needed due to ajax consitency
//useUnidiedTopology is I don't know what exactly, but the log requested me to implement
mongoose.connect(DBURL, {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true}, (err) => {
    if(err) console.log(err);
    console.log("CONNECTED TO DATABASE");
});

mongoose.Promise = Promise;

//exporting module
module.exports.Users = require('./user');
module.exports.Products = require('./product');
module.exports.Orders = require('./order');
module.exports.Contents = require('./content');
module.exports.Messages = require('./message');
