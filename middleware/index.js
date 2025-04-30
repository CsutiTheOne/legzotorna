//middleware functions in order to check if user can do or can not do something


//checking if the user is logged in at all
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    req.app.locals.previous = req.originalUrl;
    req.flash('error', 'Kérlek jelentkezz be!');
    return res.redirect('/admin');
};

//function  for checking if the user has specific right
//if do so: go further, if not: redirect backwards
function canDo(req, res, next, right){
    if(req.user.rights[right]) return next();
    //if(true) return next();
    req.flash('error', 'Pls no!');
    return res.redirect('/fooldal');
};

//now middleware functions for checking user has each right
//check if user can invite new users
exports.canInvite = (req, res, next) => {
    return canDo(req, res, next, 'canInvite');
}
//the same shit for checking if user can answer messages
exports.canAnswer = (req, res, next) => {
    return canDo(req, res, next, 'canAnswer');
}
//checking if user can manage other users
exports.canManageUsers = (req, res, next) => {
    return canDo(req, res, next, 'canManageUsers');
}
//checking if user can create new and edit existing products
exports.canManageProducts = (req, res, next) => {
    return canDo(req, res, next, 'canManageProducts');
}
exports.canManageOrders = (req, res, next) => {
    return canDo(req, res, next, 'canManageOrders');
}
//checking, if the user has the right to edit page content
exports.canEditContent = (req, res, next) => {
    return canDo(req, res, next, 'canEditContent');
}
//check if we can upload and manage files
exports.canManageFiles = (req, res, next) => {
    return canDo(req, res, next, 'canManageFiles');
}
//checking if user can modify running configuration
exports.canEditConfig = (req, res, next) => {
    return canDo(req, res, next, 'canEditConfig');
}




//exporting functions
module.exports = exports;
