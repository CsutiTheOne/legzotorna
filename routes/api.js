//frameworks for routing
const   express = require('express'),
        router = express.Router();
//database connection
const   db = require('../models');
//frameworks for authentication
const   passport = require('passport');
//helpers for API at all
const   helpers = require('../helpers/api');
//middleware for validation
const   middleware = require('../middleware');



//INITIAL SHIT
router.get('/', (req, res) => {
    res.send('API IS UP');
});


//===AUTHENTICATION ROUTES===
//REGISTER
router.post('/auth/register', (req, res) => {
    db.Users.register({
        username: req.body.username,
        email: 'sample@sample.com',
        rights: {}
    }, req.body.username, function(err, user){
        if(err){
            console.log('SEED USER WAS FAILED TO CREATE!')
        }
        else {
            // passport.authenticate("local")(req, res, function(){
            //         req.flash("success", "Üdv nálunk " + user.username);
            //         res.redirect("/admin");
            //     });
            console.log(user.username + " was registered!");
            req.flash("success", user.username + " létrehozva!");
            res.redirect("/admin/users");
        }
    });
});
//LOG IN
router.post('/auth/login', passport.authenticate("local", {
    failureRedirect: "/admin",
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Üdv újra " + req.user.username + "!");
    res.redirect(req.app.locals.previous || '/admin');
    req.app.locals.previous = null;

    // if(req.previousPath && req.previousPath.includes('admin')) res.redirect('back');
    // else res.redirect("/admin");
});
//LOG OUT
router.get('/auth/logout', (req, res) => {
    req.logout(() => {
        req.flash('info', 'Viszlát!');
        res.redirect('/fooldal');
    });
});
//also users:
//===USERS ROUTES===
//all users
router.get('/users', middleware.isLoggedIn, middleware.canManageUsers, helpers.users.get);
//specific user
router.route('/users/:user_id', middleware.isLoggedIn, middleware.canManageUsers)
.get(helpers.users.show)
.put(helpers.users.update)
.delete(helpers.users.delete);
//Methods for users
//change password
router.put('/users/:user_id/change', middleware.isLoggedIn, (req, res) => {
    //find the user
    db.Users.findById(req.params.user_id)
    .then(user => {
        if(user.username == req.user.username && req.body.new === req.body.again){
            //so, the user we looking for is the same as logged in
            //now we can change the password
            user.changePassword(req.body.old, req.body.new, function(err) {
                if(err){
                    if(err.name === 'IncorrectPasswordError'){
                        res.json({ success: false, message: 'Incorrect password' }); // Return error
                    }else {
                        res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
                    }
                } else {
                    res.status(201).json({ success: true, message: 'Jelszó sikeresen megváltoztatva.' });
                }
            })
        } else {
            res.json({ success: false, message: 'Ezt nem teheted!'});
        }
    })
    .catch(err => {
        res.send("Nem találtunk ilyen fölhaSZNÁLÓT!");
    })
});

//===PRODUCTS ROUTES===
//all products
router.route('/products')
.get(helpers.products.get)
.post(middleware.isLoggedIn, middleware.canManageProducts, helpers.products.create);
//specific products
router.route('/products/:product_id', middleware.isLoggedIn, middleware.canManageProducts)
.get(helpers.products.show)
.put(helpers.products.update)
.delete(helpers.products.delete);

//===ORDERS ROUTES===
//all orders
router.route('/orders')
.get(middleware.isLoggedIn, middleware.canManageOrders, helpers.orders.get)
.post(helpers.orders.create);
//specific order
router.route('/orders/:order_id')
.get(helpers.orders.show)
.put(middleware.canManageOrders, helpers.orders.update)
.delete(middleware.canManageOrders, helpers.orders.delete);

//===CONTENTS ROUTES===
//all contents
router.route('/contents')
.get(helpers.contents.get)
.post(middleware.canEditContent, helpers.contents.create);
//specific content
router.route('/contents/:content_id')
.get(helpers.contents.show)
.put(middleware.canEditContent, helpers.contents.update)
.delete(middleware.canEditContent, helpers.contents.delete);

//===CONTACT MESSAGING===
//all messages and creating new
router.route('/messages')
.get(middleware.isLoggedIn, middleware.canAnswer, helpers.messages.get)
.post(helpers.messages.create);
//specific message
router.route('/messages/:message_id', middleware.isLoggedIn, middleware.canAnswer)
.get(helpers.messages.show)
.put(helpers.messages.answer)
.delete(helpers.messages.delete);

//===CONFIG===
router.get('/config', helpers.config.get);
router.get('/config/set', middleware.isLoggedIn, middleware.canEditConfig , helpers.config.set);


//===FILES===
//list all the file
router.route('/files', middleware.isLoggedIn, middleware.canManageFile)
.get(helpers.files.get) //list of files
.post(helpers.files.create); //Upload
//specific file
router.route('/files/:file_name')
.get(helpers.files.show) //download
.delete(middleware.canManageFiles, helpers.files.delete); //delete
//protected JS files serving
router.get('/js/:filename', middleware.isLoggedIn, (req, res) => {
    //we should have a middleware here
    //but we need to decide wich one first

    let funcName, filename = req.params.filename;
    switch (req.params.filename) {
        case "config.js":
            funcName = "canEditConfig";
            break;
        case "files.js":
            funcName = "canManageFiles";
            break;
        case "message.js":
            funcName = "canAnswer";
            break;
        case "orders.js":
            funcName = "canManageOrders";
            break;
        case "products.js":
            funcName = "canManageProducts";
            break;
        case "users.js":
            funcName = "canManageUsers";
            break;
        default:
            funcName = null;
            break;
    }
    if(funcName){
        middleware[funcName](req, res, function(){
            res.download(__dirname + '/../protectedjs/' + filename);
        });
    } else {
        res.redirect('back');
    }
});



//export API routes
module.exports = router;



//SEEDING THE DB COMES HERE
//seeding database with genesis user
// db.Users.register({
//     username: 'seed',
//     email: 'seed@seed.com',
//     rights: {
//         canManageUsers: true
//     }
// }, 'seed' , function(err, user){
//     if(err){
//         console.log('SEED USER WAS FAILED TO CREATE!')
//     }
//     else {
//         // passport.authenticate("local")(req, res, function(){
//         //         req.flash("success", "Üdv nálunk " + user.username);
//         //         res.redirect("/admin");
//         //     });
//         console.log(user.username + " was registered!");
//     }
// });
