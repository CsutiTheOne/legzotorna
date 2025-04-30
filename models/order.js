//databasae schema describing orders from webshop
const   mongoose = require("mongoose"),
        Schema = mongoose.Schema;
        
//THIS SCHEMA DESCRIBES EVERY ORDER
var orderSchema = new Schema({
    //references to products
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Products'
        },
        quantity: Number
    }],
    details: {
        name: String,
        email: String,
        phone: String,
        zipcode: Number,
        city: String,
        address: String,
        etc: String
    },
    payment: {
        //payment method is the way how the costumer preferes to pay the order
        method: {
            type: String,
            //required: true,
            //by default it is done by előre utalás
            default: 'előre átutalás'
        },
        done: {
            //done is set to true after the payment is done by the costumer
            type: Boolean,
            default: false
        }
    },
    //date when the order was places
    date: {
        type: Date,
        default: Date.now()
    },
    //status of the order
    status: {
        type: String,
        default: 'Feldolgozás alatt' //feldolgozás alatt -> úton -> finished OR visszavonva
    }
});

//exporting model
module.exports = new mongoose.model('Orders', orderSchema);