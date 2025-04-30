//framework reqs
const   express = require('express'),
        router = express.Router();
//DATABASE CONNECTION
const   db = require('../models');
//middleware
const   mw = require('../middleware');
//configuration
const Config = require('../config');
let C = new Config();

//ADMIN PAGE ROUTES
//main page
router.get('/', (req, res) => {
    res.status(200).render('admin/index', {title: "Adminisztráció"});
});
//products page
router.get('/products', mw.isLoggedIn, mw.canManageProducts, (req, res) => {
    res.render('admin/products', {title: 'Termékek managelése'});
});
//users page
router.get('/users', mw.isLoggedIn, mw.canManageUsers, (req, res) => {
    res.render('admin/users', {title: 'Felhasználók'});
});
//at this route you can see all the messages
router.get('/messages', mw.isLoggedIn, mw.canAnswer, (req, res) => {
    db.Messages.find({})
    .then(messages => {
        res.render('admin/messages', {messages: messages, title: 'Üzenetek'});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('/admin');
    });
});
//at this route you can see all the messages
router.get('/messages/:message_id', mw.isLoggedIn, mw.canAnswer, (req, res) => {
    db.Messages.findById(req.params.message_id)
    .then(message => {
        res.render('admin/message', {message: message, title: `Válasz ${message.name} számára`});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('/admin');
    });
});

//route for listing all orders
router.get('/orders', mw.isLoggedIn, mw.canManageOrders, (req, res) => {
    db.Orders.find({})
    .then(orders => {
        res.render('admin/orders', {orders: orders, title: 'Rendelések'});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('/admin');
    });
});
//show route for one order
router.get('/orders/:order_id', mw.isLoggedIn, mw.canManageOrders, (req, res) => {
    res.render('admin/order');
});

//files
router.get('/files', mw.isLoggedIn, mw.canManageFiles, (req, res) => {
    res.render('admin/files', {title: 'Fájlok'});
});

//config page
router.get('/config', mw.isLoggedIn, mw.canEditConfig, (req, res) => {
    let current = C.load();
    res.render('admin/config', {title: 'Konfiguráció', config: current});
});

//profile page
router.get('/:user_id', mw.isLoggedIn, (req, res) => {
    //EVERY USER WILL HAVE A PROFILE PAGE
    db.Users.findById(req.params.user_id)
    .then(foundUser => {
        res.render('admin/profile', {title: foundUser.username, user: foundUser});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('back');
    });
});

//EXPORTING ROUTES
module.exports = router;
