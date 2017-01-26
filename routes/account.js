var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
module.exports = router;
var upload = multer({dest: 'uploads/'});
var User = require('../models/user');
var pg = require('pg');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET - Account page */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('account', { title: 'My Account' });
});

function ensureAuthorized(req, res, next){
    if(req.user.access < 5){
        return next();
    }
    res.redirect('/members');
}

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}