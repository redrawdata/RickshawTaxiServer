var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'uploads/'});
var User = require('../models/user');
var pg = require('pg');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = router;

/* GET - Registration page */
router.get('/', function(req, res, next) {
    console.log('serving the Registration page');
    res.render('register', { title: 'Register' });
});


/*  POST - User submits a Registration form
    ---------------------------------------
   
    Get all the data from the Registration form
        Create any other data (timestamp)
        Supply a default photo if necessary
    Check the form data for errors
    If errors
        re-render page with errors
    else
        if NIE is duplicate
            re-render page with a warning
        else
            if Username is 
*/
router.post('/', upload.single('image'), function(req, res, next){
    
    // Get or create all the form values
    console.log('Registration Attempted.....');
    var name = req.body.name;
    var surname = req.body.surname;
    var nie = req.body.nie;
    var username = req.body.username;
    var company = req.body.company;
    var email = req.body.email;
    var telephone = req.body.telephone;
    var pass1 = req.body.password1;
    var pass2 = req.body.password2;
    var date = new Date();
    var regDate = date.getTime();
    var lastSeen = regDate;
    var isApproved = false;
    var isSuspended = false;
    var access = 10;
    // Determine and set the Image value
    if(req.file){
        console.log('/tImage supplied by User. Uploading Image....');
        console.log(req.file);
        var profileImageOriginalName = req.file.originalname;
        var profileImageName = req.file.filename;
        var profileImageMime = req.file.mimetype;
        var profileImagePath = req.file.path;
        var profileImageExt = req.file.extension;
        var profileImageSize = req.file.size;
    }
    else {
        console.log('/tNo Image supplied or Image too big. Using stock image');
        var profileImageName = 'noimage.png';
    }
    // Check form for errors
    req.checkBody('name', 'First Name is required').notEmpty();
    req.checkBody('surname', 'Surname is required').notEmpty();
    req.checkBody('nie', 'NIE is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('company', 'Company is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('telephone', 'Telephone is required').notEmpty();
    req.checkBody('password1', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password1);
    var errors = req.validationErrors();
    if (errors) {
        console.log('/tRegistration form contained error(s)');
        res.render('register', {
            errors: errors,
            name: name,
            surname: surname,
            nie: nie,
            username: username,
            company: company,
            email: email,
            telephone: telephone,
            password1: pass1,
            password2: pass2
        });
    }
    else {
        // Form data is acceptable, now check for duplicate NIE and Username
        console.log('/tRegistration form is COMPLETE');
        console.log('/tChecking for NIE duplication....');
        // Check for NIE duplication
        User.getUserByNie (nie, function(err, result) {
            if (err) {
                console.log('/tProblem checking for a matching NIE');
                return;
            }
            if (result.rowCount > 0){
                console.log('/tmatch found on NIE');
                req.flash('failure', 'NIE is already in use on our system');
                res.render('register', {
                    name: name,
                    surname: surname,
                    nie: nie,
                    username: username,
                    company: company,
                    email: email,
                    telephone: telephone,
                    password1: pass1,
                    password2: pass2
                });
            }
            else{
                console.log('/tNIE is UNIQUE');
                console.log('/tChecking for Username duplication....');
                User.getUserByUsername (username, function(err, result) {
                    if (err) {
                        console.log('Problem checking for a matching Username');
                        return;
                    }
                    if (result.rowCount > 0){
                        console.log('/tmatch found on Username');
                        req.flash('failure', 'Username is already in use on our system');
                        res.render('register', {
                            name: name,
                            surname: surname,
                            nie: nie,
                            username: username,
                            company: company,
                            email: email,
                            telephone: telephone,
                            password1: pass1,
                            password2: pass2
                        });
                    }
                    else{
                        console.log('/tUsername is UNIQUE');
                        console.log('/tAll post-registration checks COMPLETED');https://mysterious-river-55696.herokuapp.com/users/register
                        // all Registration checks passed, save to database 
                        var newUser = new User(name, surname, nie, username, company, email, telephone, pass1, profileImageName, regDate, lastSeen, isApproved, isSuspended, access);
                        console.log('/tsaving in database');
                        // Create User in DB    
                        User.insertUser(newUser, function(err, result){
                            if(err) {
                                console.log('/tError during INSERT in Members table: ' + err);
                                res.redirect('/register');
                                return;
                            } 
                            console.log('/tNew member for Approval added to Members table');
                            // Success Message
                            req.flash('success', 'You are now registered and may login');
                        
                            // res.location('/');
                            res.redirect('/users');
                        });
                    }
                });
            }
        });
    }
});
        

passport.serializeUser(function(user, done) {
    console.log('serializing User');
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializing User');
    User.getUserById(id, function (err, user) {
    user.id = user[0].memberno;
    done(err, user);
  });
});

// called when a POST to '/users/login' is made (via passport.authenticate)
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



