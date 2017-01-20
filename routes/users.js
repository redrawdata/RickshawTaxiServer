var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
var upload = multer({dest: 'uploads/'});
var User = require('../models/user');
var pg = require('pg');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET - Members page request */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Users' });
});

/* GET - Register page request */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

/* GET - Login page request */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/logout', function(req,res){
    req.logout();
    req.flash('success','you have logged out');
    res.redirect('/users/login');
});


/*  POST - User submits a Registration form
    ---------------------------------------
   
    Get all the data from the Registration form
        Create any other data
        Supply a default photo if necessary
    Check the form data for errors
    If errors
        re-render page with errors
    else
        */
router.post('/register', upload.single('image'), function(req, res, next){
    
    // Get or create all the form values
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
        
        console.log('Image supplied by User. Uploading Image....');
        console.log(req.file);
        var profileImageOriginalName = req.file.originalname;
        var profileImageName = req.file.filename;
        var profileImageMime = req.file.mimetype;
        var profileImagePath = req.file.path;
        var profileImageExt = req.file.extension;
        var profileImageSize = req.file.size;
    
    }
    
    else {
        
        console.log('No Image supplied or Image too big. Using stock image');
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
        
        console.log('Registration form contained error(s)');
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
        
        // Check for NIE duplication
        //User.getUserByNie (nie, function(err, result) {
        //    if (err) throw err;
        //});
        /*
        pg.connect(connect, function(err, client) {
            if (err) throw err;
            console.log('Connected to Postgres...Searching for duplicate NIE in Members table');
            client.query("SELECT * FROM public.members WHERE nie = $1",[username]), function (err, result) {
                done(); //this done callback signals the pg driver that the connection can be closed or returned to the connection pool

                if (err) {
                    // pass the error to the express error handler
                    return next(err);
                }var app = express();

            // res.send(200)
            }
        });
        */
        var newUser = new User(name, surname, nie, username, company, email, telephone, pass1, profileImageName, regDate, lastSeen, isApproved, isSuspended, access);
        console.log(newUser);
        console.log('saving in database');
        // Create User in DB    
        User.insertUser(newUser, function(err, result){
            if(err) {
                console.log('Error during INSERT in Members table: ' + err);
                res.redirect('/users/register');
                return;
            } 
            console.log('Result of query: ' + result);
            console.log('New member for Approval added to Members table');
            // Success Message
            req.flash('success', 'You are now registered and may login');
            
            // res.location('/');
            res.redirect('/');
         });
    }
});

passport.serializeUser(function(user, done) {
    console.log('serializing User');
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializing User');
    User.getUserById(id, function (err, user) {
    user.id = user[0].memberno;
    done(err, user);
  });
});

passport.use(new LocalStrategy(
    function(username, password, done){
        console.log('Passport Authentication attempt with: ' + username + ' - ' + password);
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                console.log('unknown user');
                return done(null, false, {message:'unknown user'});
            }
            console.log(user[0].password);
            User.comparePassword(password, user[0].password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    user.id = user[0].memberno;
                    return done(null, user);
                }
                else{
                    console.log('invalid password');
                    return done(null, false, {message:'invalid password'});
                }
            }
            );
        
        });
        
            
    }
));

// , passport.authenticate('local', { failureRedirect: '/login', failureFlash:'authentication failed' })

/* POST - User submits a Login form */
router.post('/login', passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:'invalid username or password'}), function(req, res){
    
    /*
    console.log('Login form submitted');
    console.log(req.body);
    var username = req.body.username;
    console.log('Passport Authentication attempt with: ' + username);
    User.getUserByUsername(username, function(err, user){
        console.log('username match attempted');
        console.log(user);
        if(err) throw err;
        if(!user){
            console.log('unknown user');
            return done(null, false, {message:'unknown user'});
        }
        if (user === ''){
            console.log('unknown user');
            return done(null, false, {message:'unknown user'});
            
        }
        
    });
    */
    //var password = req.body.password;
    // this runs is LocalStraatergy is TRUE
    console.log('Authentication successful');
    req.flash('success', 'You are logged in');
    res.redirect('/members');
});

module.exports = router;
