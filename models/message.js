//database schmea descring the Products for the webshop part
const   mongoose = require("mongoose"),
        Schema = mongoose.Schema;

//THIS SCHEMA DESCRIBES EVERY PRODUCT
var messageSchema = new Schema({
    //name of the customer in touch
    name: {
        type: String,
        required: true,
    },
    //contact email of costumer
    email: {
        type: String,
        required: true,
    },
    //subject of contact
    subject: {
        type: String,
        required: true,
    },
    //the actual message
    message: {
        type: String,
        required: true,
    },
    answer: {
        done: {
            type: Boolean,
            default: false
        },
        text: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

//exporting model
module.exports = new mongoose.model('Messages', messageSchema);
