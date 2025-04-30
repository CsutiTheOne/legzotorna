//database schmea descring the content on editable pages
const   mongoose = require("mongoose"),
        Schema = mongoose.Schema;

//THIS SCHEMA DESCRIBES EVERY CONTENT ARTICLE
var contentSchema = new Schema({
    page: {
        type: String,
        required: true
    },
    content: String
});

//exporting model
module.exports = new mongoose.model('Contents', contentSchema);
