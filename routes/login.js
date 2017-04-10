const ID = '(login.js) ';
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
    
    // login good - redirect to members page
    console.log('\t' + ID + 'redirecting to Members page...');
    //req.flash('success', 'You are logged in');
    //req.wasALogin = true;
    res.redirect('/members');
    
    
});

passport.serializeUser(function(user, done) {
    console.log('\t' + ID + 'User serialized');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('\t' + ID + 'User deserialized');
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

// called when a POST to '/' is made (via passport.authenticate)
passport.use(new LocalStrategy(
    function(username, password, done){
        console.log(ID + 'Logging in...');
        User.getUserByUsername(username, function(err, user){
            if(err) {
                console.log('\t' + ID + 'Authenication fail during DB query' + err);
                return done(null, false, {message:'unable to access database'});
            }
            if(!user){
                console.log('\t' + ID + 'no match for Username');
                return done(null, false, {message:'unknown user'});
            }
            else{
                console.log('\t' + ID + 'match on Username');
                User.comparePassword(password, user.password, function(err, isMatch){
                    if(err) throw err;
                    if(isMatch){
                        console.log('\t' + ID + 'match on Password');
                        return done(null, user); // passport.serializeUser now happens
                    }
                    else{
                        console.log('\t' + ID + 'no match on Password');
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



