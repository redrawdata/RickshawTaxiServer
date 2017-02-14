var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = router;

/* GET - Login page request */
router.get('/', function(req, res, next) {
    console.log('serving the Login page');
    res.render('login', { title: 'Login' });
});

/* GET - Chat page request */
router.get('/chat', ensureAuthenticated, function(req, res, next) {
    console.log('serving the Chat page');
    res.render('chat', { title: 'Chat' });
});

/* GET - Account page request */
router.get('/account', ensureAuthenticated, function(req, res, next) {
    console.log('serving the Account page');
    res.location('account', { title: 'My Account' });
});

/* GET - Logout request */
router.get('/logout', ensureAuthenticated, function(req, res, next){
    console.log('logging out the user');
    req.logout();
    req.flash('success','you have logged out');
    res.redirect('/users');
});


// stop access to those not logged in 
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users');
}

/*  POST - User submits a Login form
    --------------------------------
    Login credentials authenticated with Passportjs
        redirected to Login page if not authenticated
        redirected to relevant User page depending on Access
        <5      - go to Admin page
        5-14    - go to Chat page
*/
router.post('/', passport.authenticate('local',{failureRedirect:'/users', failureFlash:'invalid username or password'}), function(req, res){
    //var password = req.body.password;
    // this runs if LocalStraatergy is TRUE
    console.log('Authentication successful');
    console.log(req.user);
    req.flash('success', 'You are logged in');
    if (req.user.access < 5){
        res.redirect('/users/admin');
    }
    if (req.user.access >= 5 && req.user.access < 15){
        res.redirect('/users/chat');
    }
});

passport.serializeUser(function(user, done) {
    console.log('serializing User !!!');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializing User');
    User.getUserById(id, function (err, user) {
    user.id = user[0].memberno;
    user.access = user[0].access;
    done(err, user);
  });
});

// called when a POST to '/users' is made (via passport.authenticate)
passport.use(new LocalStrategy(
    function(username, password, done){
        console.log('Passport Authentication attempted...');
        User.getUserByUsername(username, function(err, result){
            if(err) throw err;
            if(result.rowCount == 0){
                console.log('no match for Username');
                return done(null, false, {message:'unknown user'});
            }
            console.log('match on Username');
            var user = JSON.stringify(result.rows, null, '    ');
            user = JSON.parse(user);
            User.comparePassword(password, user[0].password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    console.log('match on Password');
                    user.id = user[0].memberno;
                    user.access = user[0].access;
                    console.log('Authentication SUCCESSFUL: UserID: ' + user.id + ' has AccessLevel: ' + user.access);
                    return done(null, user);
                }
                else{
                    console.log('no match for Password');
                    return done(null, false, {message:'invalid password'});
                }
            });
        });
    }
));



