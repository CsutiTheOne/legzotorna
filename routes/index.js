const   express = require('express'),
        router = express.Router();
//later on we'll need to requiest content from db
const   db = require('../models');
//middleware functions for security checks
const   middleware = require('../middleware');

//ROOT ROUTER (empty yet)
router.get('/', (req, res) => {
    res.redirect('/fooldal');
});

//SPECIAL PAGES
//ACTUAL homepage
router.get('/fooldal', (req, res) => {
    res.status(200).render('index/fooldal', {title: "Főoldal"});
});
//kapcsolat PAGE
router.get('/contact', (req, res) =>{
    res.status(200).render('index/contact', {title: "Kérdése van?"});
})

//WEBSHOP
//the shop
router.get('/vasarlas', (req, res) => {
    db.Products.find()
    .then(allProducts => {
        res.status(200).render('index/vasarlas', {title: "Webáruház", products: allProducts});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('back');
    });
});
//checkout
router.get('/vasarlas/checkout/', (req, res) => {
    res.render('index/checkout');
});
//ORDER
//Relevant only after an order is made
//email link leads here
router.get('/order/:order_id', (req, res) => {
    db.Orders.findById(req.params.order_id).
    populate('products.product').exec((err, foundOrder) => {
        if(err){
            req.flash('error', err.message);
            res.redirect('/');
        }
        res.render('index/order', {order: foundOrder});
    });
});



//EDITABLE PAGES
//like: rolam oldal, tapasztalatok
router.get('/:page', (req, res) => {
    db.Contents.find({page: req.params.page})
    .then(foundContent => {
       res.status(200).render('index/page', {title: req.params.page, content: foundContent, page: req.params.page});
    })
    .catch(err => {
        req.flash('error', err.message);
        res.render('index/page', {title: req.params.page, page: req.params.page});
    });
});

//===EDITOR FOR EDITABLE PAGES===
//EDITOR FOR EDITABLE PAGES
router.get('/:page/new', middleware.isLoggedIn, middleware.canEditContent, (req, res) => {
    let page = req.params.page;
    res.render('index/editor', {
        title: `Új tartalom ${page} oldalra`,
        content: false,
        page: page
    });
});
//Also editor, but for existing content
router.get('/:page/:content_id', middleware.isLoggedIn, middleware.canEditContent, (req, res) => {
    db.Contents.findById(req.params.content_id)
    .then(foundContent => {
        let page = req.params.page;
        res.render('index/editor', {
            title: `${page} oldal tartalmának szerekesztése`,
            page: page,
            content: foundContent
        });
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('back');
    });
});


//exporting routes
module.exports = router;
