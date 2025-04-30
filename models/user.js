//MongoDB schema for storing users
const   mongoose = require("mongoose"),
        passportLocalMongoose = require('passport-local-mongoose'),
        Schema = mongoose.Schema;

//THIS SCHEMA DESRCRIBES EVERY USER
var userSchema = new Schema({
    username: {
        //usernames actually are not nessesery
        type: String,
        unique: true,
        required: true
    },
    email: {
        //emails are a better choice for authentication
        type: String,
        unique: true,
        required: true
    },
    rights: {
        //this object describes what a user can do to the website
        canAnswer: {type: Boolean, default: false}, //answer to costumer contact messages
        canEditContent: {type: Boolean, default: false},  //edit the contents of specific pages on the website
        canEditConfig: {type: Boolean, default: false}, //edit the settings of the backend application
        canInvite: {type: Boolean, default: false}, //invite new users (becouse registration is strict)
        canManageFiles: {type: Boolean, default: false}, //upload, use and delete files
        canManageOrders: {type: Boolean, default: false}, //edit status of order
        canManageProducts: {type: Boolean, default: false}, //add and edit existring products in webshop
        canManageUsers: {type: Boolean, default: false} //manage registered users rights

    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

//compatibility between passport and mongoose
userSchema.plugin(passportLocalMongoose);

//exporting model
module.exports = new mongoose.model('Users', userSchema);
