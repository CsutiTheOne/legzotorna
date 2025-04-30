//database schmea descring the Products for the webshop part
const   mongoose = require("mongoose"),
        Schema = mongoose.Schema;

//THIS SCHEMA DESCRIBES EVERY PRODUCT
var productSchema = new Schema({
    //simply the name of the product
    title: {
        type: String,
        required: true,
        unique: true
    },
    //the price of it
    price: {
        type: Number,
        required: true
    },
    // //images of the product, the first will be used as thumbnail
    // images: Array,
    //brief description
    description: String,
    //The type of the pdocuts -> can be either physical or digital good
    type: {
        type: String,
        required: true
    },
    ships: {
        type: Boolean,
        default: true
    },
    //URL for digital 'products' like DVD content
    //only needed if the product's type is set to DIGITAL
    url: String
});

//exporting model
module.exports = new mongoose.model('Products', productSchema);
