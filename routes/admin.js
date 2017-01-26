var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

module.exports = router;


/* GET - Admin page */
router.get('/', ensureAuthenticatedAndAuthorized, function(req, res, next) {
    console.log('serving the Admin page');
    res.render('admin', { title: 'Administration' });
});

function ensureAuthenticatedAndAuthorized(req, res, next){
    if(req.isAuthenticated()){
        if(req.user[0].access < 5){
            console.log('Authenticated and Authorized to see Admin page');
            return next();
        }
        else{
            console.log('Authenticated but not Authorized to see Admin page');
            res.redirect('/users/chat');
            return;
        }
        console.log('Neither Authenticated nor Authorized to see Admin page');
        res.redirect('/users');
    }
}