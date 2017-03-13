// login.js = Routing for Login page

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = router;

/* GET - Login page request */
router.get('/', ensureNotLoggedIn, function(req, res) {
    console.log('serving the Login page');
    res.render('login', { title: 'Login' });
});

function ensureNotLoggedIn(req, res, next){
    console.log('checking if already logged in...');
    if(req.isAuthenticated()){
        console.log('User is already logged in, redirecting to Members Area...');
        res.redirect('/members');
        return(false);
    }
    console.log('not logged in - allowing access to Login Page');
    return next();
}
/*  POST - User submits a Login form
    --------------------------------
    Login credentials authenticated with Passportjs
        redirected to Login page if not authenticated

*/

router.post('/', passport.authenticate('local',{failureRedirect:'/login', failureFlash:'invalid username or password'}), function(req, res){
    console.log(req.user.id);
    console.log(req.user.name);
    console.log(req.user.surname);
    console.log(req.user.username);
    console.log(req.user.access);
    
    
    console.log('redirecting to Members page...');
    //var password = req.body.password;
    // this runs if LocalStrategy is TRUE
    // console.log(req.user);
    req.flash('success', 'You are logged in');
    res.redirect('/members');
    /*
    if (req.user.access < 5){
        res.redirect('/admin');
    }
    if (req.user.access >= 5 && req.user.access < 15){
        res.redirect('/members');
    }
    */
});

passport.serializeUser(function(user, done) {
    console.log('User serialized by login.js');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('User deserialized by login.js');
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

// called when a POST to '/' is made (via passport.authenticate)
passport.use(new LocalStrategy(
    function(username, password, done){
        console.log('Attempting Authentication with PassportJS...');
        console.log('   looking for a Username');
        User.getUserByUsername(username, function(err, user){
            if(err) {
                console.log('Authenication fail during DB query' + err);
                return done(null, false, {message:'unable to access database'});
            }
            if(!user){
                console.log('   no match for Username');
                return done(null, false, {message:'unknown user'});
            }
            else{
                console.log('   match on Username');
                console.log('   looking for a Password match');
                User.comparePassword(password, user.password, function(err, isMatch){
                    if(err) throw err;
                    if(isMatch){
                        console.log('   match on Password');
                        console.log('Authentication SUCCESSFUL: User Info');
                        console.log('   UserID: ' + user.id);
                        console.log('   User Full Name: ' + user.name + ' ' + user.surname);
                        console.log('   Username: ' + user.username);
                        console.log('   AccessLevel: ' + user.access);
                        return done(null, user); // passport.serializeUser now happens
                    }
                    else{
                        console.log('   no match for Password');
                        console.log('Authentication FAILED!!!');
                        return done(null, false, {message:'invalid password'});
                    }
                });
            }
            //var user = JSON.stringify(result.rows, null, '    ');
            //console.log(user);
            //user = JSON.parse(user);
            
        });
    }
));



