//ENTRY POINT OF WEB APPLICATION
//framework requirements
const   express = require('express'),
        app = express(),
        http = require("http"),
        https = require("https");
//packages
const   bodyParser = require('body-parser'),
        methodOverride = require('method-override'),
        fileUpload = require('express-fileupload'),
        //for Authentication
        session = require('express-session'),
        passport = require('passport'),
        localStrategy = require('passport-local').Strategy,
        //other shits
        fs = require('fs'),
        flash = require('connect-flash'),
        helmet = require('helmet');
//database
const   Users = require('./models').Users;
//routes
const   indexRoutes = require('./routes/index'),
        adminRoutes = require('./routes/admin'),
        mediaRoutes = require('./routes/media'),
        apiRoutes   = require('./routes/api');
//config settings
const   Config = require('./config'),
        c = new Config();
//GLOBAL ENVIRONMENTAL VARIABLES
const   PORT = process.env.PORT || 80,
        S_PORT = process.env.S_PORT || 443;
        IP = process.env.IP;

//MODULE SETUPS
app.set('view engine', 'ejs'); //using templates
app.use(bodyParser.urlencoded({extended: true})); //ensure data Body is right
app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
app.use(flash()); //flash messages
app.use(methodOverride('_method')); //in case we use Forms
//app.use(helmet());

//share public directory
app.use(express.static(__dirname + "/public"));

//AUTHENTICATION
//session setup
app.use(session({
    secret: "LegzotornaszNemLegtornasz",
    resave: false,
    saveUninitialized: false
}));
//passport setup
app.use(passport.initialize());
app.use(passport.session());
//local strategy
passport.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, Users.authenticate())
);
//session setus
passport.serializeUser(function(user, done){
    done(null, user._id);
});
passport.deserializeUser(function(id, done){
    Users.findById(id, function(err, user){
        done(err, user);
    });
});

//MIDDLEWARE FOR EVERY ROUTE
app.use(function(req, res, next) {
    //default title for every route
    res.locals.title = "Légzőtorna";

    //var for te user logged in
    res.locals.currentUser = req.user;

    //flash message setup
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");

    //config
    res.locals.config = c.load();

    return next();
});

app.locals.previous = null;

//ROUTES SETUP
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/media', mediaRoutes);
app.use(indexRoutes);

//SSL
var key = "", cert = "";
try {
    key = fs.readFileSync('./ssl/privatekey.pem')
    c = fs.readFileSync('./ssl/certificate.pem')
} catch(e) {

}
var options = {
    key:  key,
    cert: cert
};

//Application listening to requests
http.createServer(app).listen(PORT);
//https.createServer(options, app).listen(S_PORT);



//END


// http.createServer(app).listen(80);
// https.createServer(options, app).listen(IP, function() {
//     console.log('___--- APPLICATION HAS BEEN STARTED! ---___');
//     console.log('\tListening on PORT: ' + PORT);
//     //console.log('\tACCES THROUG IP: ' + IP);
//     console.log('\t\tGLHF');
// });
