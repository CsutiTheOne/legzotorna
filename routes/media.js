//Framework request
const express = require('express'),
    router = express.Router();
//Connection with Database
const db = require('../models');

//index route
//we ask for email address here
router.get('/', (req, res) => {
    res.render('media/index', {title: 'Média'});
});

//after user inserted the email address of his
//make a request on the right blah blah blah
router.post('/query', (req, res) => {
    let queryMail = req.body.email;
    //1.we need every order including the specific email
    db.Orders.find({"details.email": queryMail})
    .populate('products.product')
    .then(orders => {
        let products = [];
        orders.forEach((val, i, arr) => {
            if(val.payment.done) products = products.concat(val.products);
        });
        products = products.filter((prod) => prod.product.type == 'digital');
        //res.send(products.filter((prod) => prod.product.type == 'digital'));
        if(products.length) res.render('media/show', {title: req.body.email, products: products});
        else {
            req.flash('error', "Nincs digitális termék ilyen megrendelői email címre");
            res.redirect('back');
        }
    })
    .catch(err => {
        req.flash('error', err.message);
        res.redirect('back');
    });
});


module.exports = router;
