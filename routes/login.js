//

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


/*  POST - User submits a Login form
    --------------------------------
    Login credentials authenticated with Passportjs
        redirected to Login page if not authenticated
        redirected to relevant User page depending on Access
        <5      - go to Admin page
        5-14    - go to Chat page
*/
router.post('/', passport.authenticate('local',{failureRedirect:'/login', failureFlash:'invalid username or password'}), function(req, res){
    console.log(req.user.id);
    console.log(req.user[0].name);
    console.log(req.user[0].surname);
    console.log(req.user[0].username);
    console.log(req.user[0].access);
    
    console.log('redirecting to Members page...');
    //var password = req.body.password;
    // this runs if LocalStraatergy is TRUE
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
    console.log('User serialized by PassportJS');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('User deserialized by PassportJS');
    User.getUserById(id, function (err, user) {
    user.id = user[0].memberno;
    user.name = user[0].name;
    user.surname = user[0].surname;
    user.username = user[0].username;
    user.access = user[0].access;
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
                User.comparePassword(password, user[0].password, function(err, isMatch){
                    if(err) throw err;
                    if(isMatch){
                        console.log('   match on Password');
                        user.id = user[0].memberno;
                        console.log('Authentication SUCCESSFUL: User Info');
                        console.log('   UserID: ' + user.id);
                        console.log('   User Full Name: ' + user[0].name + ' ' + user[0].surname);
                        console.log('   Username: ' + user[0].username);
                        console.log('   AccessLevel: ' + user[0].access);
                        return done(null, user);
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



