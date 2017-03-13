var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'public/images/uploads/'});
var User = require('../models/user');
var pg = require('pg');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
module.exports = router;

/* GET - Registration page */
router.get('/', ensureNotLoggedIn, function(req, res) {
    console.log('serving the Registration page');
    res.render('register', { title: 'Register' });
});

// Helper function - blocks access to GET and POST requests while the User is logged in
function ensureNotLoggedIn(req, res, next){
    console.log('checking if already logged in...');
    if(req.isAuthenticated()){
        console.log('User is already logged in, redirecting to Members Area...');
        res.redirect('/members');
        return(false);
    }
    console.log('not logged in - allowing access to Register GET and POST');
    return next();
}

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
            if Username is duplicate
                re-render page with a warning
*/
router.post('/', ensureNotLoggedIn, function(req, res,next){
    return next();
});

router.post('/', upload.single('image'), function(req, res){
    // photo has been uploaded to server (may need to delete it later if the registration is incomplete)
    console.log('Registration Attempted.....');
    // Capture all the form values
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
    var isApproved = 'false';
    var isSuspended = 'false';
    var access = 10;
    // Check if a file was uploaded
    if(req.file){
        // User supplied a file
        console.log('   Image supplied by User. Uploading Image....');
        console.log('       ' + req.file);
        var profileImageOriginalName = req.file.originalname;
        var profileImageName = req.file.filename;
        var profileImageMime = req.file.mimetype;
        var profileImagePath = req.file.path;
        var profileImageExt = req.file.extension;
        var profileImageSize = req.file.size;
    }
    else {
        console.log('   No Image supplied or Image too big. Using stock image');
        var profileImageName = 'noimage.png';
        var profileImageMime = 'image/png';
    }
    console.log(name);
    console.log(surname);
    console.log(nie);
    console.log(username);
    console.log(company);
    console.log(email);
    console.log(telephone);
    console.log(pass1);
    console.log(profileImageName);
    console.log(regDate);
    console.log(lastSeen);
    console.log(isApproved);
    console.log(isSuspended);
    console.log(access);
    console.log(profileImageMime);
    
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
    //req.checkBody('image', 'A photo is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        if(profileImageName !== 'noimage.png'){
            fs.unlink("./public/images/uploads/" + profileImageName, function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
        }
        console.log('   Registration form contained error(s)');
        res.render('register', {
            errors: errors,
            name: name,
            surname: surname,
            nie: nie,
            username: username,
            company: company,
            email: email,
            telephone: telephone,
            image: profileImageOriginalName
        });
    }
    else {
        // Form data is acceptable, now check for duplicate NIE and Username
        console.log('   Registration form is COMPLETE');
        console.log('   Checking for NIE duplication....');
        // Check for NIE duplication
        User.NieDuplicated (nie, function(isDupicated) {
            if (isDupicated){
                // delete image if uploaded by User
                if(profileImageName !== 'noimage.png'){
                    fs.unlink("./public/images/uploads/" + profileImageName, function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });
                }
                console.log('       match found on NIE');
                req.flash('failure', 'NIE is already in use on our system');
                res.render('register', {
                    name: name,
                    surname: surname,
                    username: username,
                    company: company,
                    email: email,
                    telephone: telephone,
                    image: profileImageOriginalName
                });
            }
            else{
                console.log('       NIE is UNIQUE');
                console.log('   Checking for Username duplication....');
                User.UsernameDuplicated (username, function(isDupicated) {
                    if (isDupicated){
                        // delete image if uploaded by User
                        if(profileImageName != 'noimage.png'){
                            fs.unlink("./public/images/uploads/" + profileImageName, function(err){
                                if(err) return console.log(err);
                                console.log('file deleted successfully');
                            });
                        }
                        console.log('       match found on Username');
                        req.flash('failure', 'Username is already in use on our system');
                        res.render('register', {
                            name: name,
                            surname: surname,
                            nie: nie,
                            company: company,
                            email: email,
                            telephone: telephone,
                            image: profileImageOriginalName
                        });
                    }
                    else{
                        console.log('       Username is UNIQUE');
                        console.log('   All post-registration checks COMPLETED');
                        // all Registration checks passed, save to database 
                        var newUser = new User("",name, surname, nie, username, company, email, telephone, pass1, profileImageName, regDate, lastSeen, isApproved, isSuspended, access, profileImageMime);
                        console.log('       saving in database');
                        console.log(newUser);
                        // Create User in DB    
                        User.insertUser(newUser, function(err, result){
                            if(err) {
                                console.log('       Error during INSERT in Members table: ' + err);
                                res.redirect('/register');
                                return;
                            } 
                            console.log('   New member for Approval added to Members table');
                            // Success Message
                            req.flash('success', 'You are now registered and may login');
                        
                            // res.location('/');
                            res.redirect('/login');
                        });
                    }
                });
            }
        });
    }
});