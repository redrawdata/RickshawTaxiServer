// app.js - mysterious-river-55696

// Acquired Node-Modules and set any Variables
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var pg = require('pg');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
//var bcrypt = require('bcrypt');
var _ = require("underscore");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);

/*
  The list of participants in our chatroom.
  The format of each participant will be:
  {
    id:         "sessionId",
    name:       "participantName",
    surname:    "surname",
    username:   "username",
    company:    "company",
    
    
  }
*/
var participants = [];

// add a Participant - just for testing purposes
participants.push({
    id:         'fake sessionId1', 
    name:       'fake1',
    surname:    'member1',
    username:   'Fake 1',
    company:    'IBCN',
    nie:        'Y1234567X',
    lat:        '41.408',
    lng:        '2.17',
    onRide:     'false'
});
participants.push({
    id:         'fake sessionId2', 
    name:       'earthquake',
    surname:    'shaker',
    username:   'Quaker',
    company:    'IBCN',
    nie:        'Y1234945X',
    lat:        '41.4081',
    lng:        '2.171',
    onRide:     'false'
});
participants.push({
    id:         'fake sessionId3', 
    name:       'fake3',
    surname:    'member3',
    username:   'Fake 3',
    company:    'IBCN',
    nie:        'Y1234567X',
    lat:        '41.408',
    lng:        '2.171',
    onRide:     'false'
});
participants.push({
    id:         'fake sessionId4', 
    name:       'earthquake2',
    surname:    'shaker2',
    username:   'Quaker2',
    company:    'IBCN',
    nie:        'Y1234945X',
    lat:        '41.4081',
    lng:        '2.17',
    onRide:     'false'
});
// set Routing Vaiables
var home = require('./routes/home');
var rickshaws = require('./routes/rickshaws');
var tours = require('./routes/tours');
var bookings = require('./routes/bookings');
var about = require('./routes/about');
var register = require('./routes/register');
var login = require('./routes/login');
var contact = require('./routes/contact');
var members = require('./routes/members');
var admin = require('./routes/admin');
var coords = require('./routes/coords');

console.log('Node-Modules acquired and Variables set in app.js');
console.log('   Online Total = ' + participants.length);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
console.log('   View Engine is ' + app.get('view engine'));

// set environment
app.set('port', process.env.PORT || 8080);

// setup middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle Express sessions
app.use(session({
    secret:'cablecarguy',
    saveUninitialized: true,
    resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Flash messaging
app.use(flash());

/*
this will happen before every GET and POST request, it sets a 
Global Variable called 'messages' which allows....
*/
app.use(function (req, res, next) {
    console.log('setting Global Variable - messages');
    res.locals.messages = require('express-messages')(req, res);
    next();
});

/*
this will happen before every GET request, it sets a 
Global Variable called 'user' which allows checking of
the 'user' state
*/
app.get('*', function (req, res, next){
    console.log('setting Global Variables');
    console.log('Participants currently: ' + participants);
    res.locals.participants = participants;
    res.locals.user = req.user || null;
    for (i = 0; i < res.locals.participants.length; i++){
        console.log('   Participant No:' + i + '   ID: ' + res.locals.participants[i].id + '    Name: ' + res.locals.participants[i].name);
    }
    if (res.locals.user){
        console.log('   userID = ' + res.locals.user.id + 
                    ' UserFullName = ' + res.locals.user[0].name + 
                    ' ' + res.locals.user[0].surname +   
                    ' Username = ' + res.locals.user[0].username + 
                    ' UserAccess = ' + res.locals.user[0].access);
    }
    else {
        console.log('   No User Info');
    }
    next();
});

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

app.use('/', home);
app.use('/rickshaws', rickshaws);
app.use('/tours', tours);
app.use('/bookings', bookings);
app.use('/about', about);
app.use('/register', register);
app.use('/login', login);
app.use('/members', members);
app.use('/contact', contact);
app.use('/admin', admin);
app.use('/allpositions', coords);

//POST method to create a chat message
app.post("/message", function(request, response) {
    console.log('POST to /message - app.js');
    //The request body expects a param named "message"
    var message = request.body.message;
        console.log(message);
    //If the message is empty or wasn't sent it's a bad request
    if(_.isUndefined(message) || _.isEmpty(message.trim())) {
        return response.status(400).json({error: "Message is invalid"});
    }
        //We also expect the sender's name with the message
    var name = request.body.name;

    //Emit the new message to all Participants (.sockets)
    io.sockets.emit("incomingMessage", {message: message, name: name});
    //Looks good, let the client know
    response.status(200).json({message: "Message received"});

});

// Handler for Socket.IO events

/* Connection event - occurs when the User(Client) becomes a 'live' User
    by attempting a socket.io connection to the Server*/
io.on("connection", function(socket){
    console.log('A connection has occurred (logged by app.js)');
    
    //Helper function to console.log the current Participants
    function logParticipants(){
        console.log('Current Participants');
        for(i=0; i<participants.length; i++){
            console.log('   ' + participants[i].username);
        }
    }
    /*
        After connecting to the Server the Client will emit a "newUser" event,
        this will allow the Server to update the Participants' list,
        adding the User data and deleting duplicate Users' data...
        then we'll emit an event called "newConnection" with a list of all
        participants to all connected clients
    */
    socket.on("newUser", function(data) {
        console.log('Server notified of a newUser...');
        // add the newUser to the Participants list
        participants.push({ id:         data.id,
                            name:       data.name,
                            surname:    data.surname,
                            username:   data.username
        });
        // 
        io.sockets.emit("newConnection", {participants: participants});
  });

  /*
    When a user changes his name, we are expecting an event called "nameChange"
    and then we'll emit an event called "nameChanged" to all participants with
    the id and new name of the user who emitted the original message
  */
  socket.on("nameChange", function(data) {
    _.findWhere(participants, {id: socket.id}).name = data.name;
    io.sockets.emit("nameChanged", {id: data.id, name: data.name});
  });

  /*
    When a client disconnects from the server, the event "disconnect" is automatically
    captured by the server. It will then emit an event called "userDisconnected" to
    all participants, with the id of the client that disconnected
  */
  socket.on("disconnect", function() {
    participants = _.without(participants,_.findWhere(participants, {id: socket.id}));
    io.sockets.emit("userDisconnected", {id: socket.id, sender:"system"});
  });

});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Start the http server at port and IP defined before
http.listen(app.get('port'), function(){
    console.log('   listening on port: ' + app.get('port'));
});

module.exports = app;
module.exports = io;
module.exports = http;