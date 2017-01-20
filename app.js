// app.js - Awesome Chatroom

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
var bcrypt = require('bcrypt');
var _ = require("underscore");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);
var participants = [];
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//Server's IP address
//app.set("ipaddr", "127.0.0.1");

//Server's port number
app.set('port', process.env.PORT || 8080);
//app.set("port", 8080);
//http.listen(8080, "127.0.0.1");
// uncomment after placing your favicon in /public
//
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
var users = require('./routes/users');


/*
  The list of participants in our chatroom.
  The format of each participant will be:
  {
    id: "sessionId",
    name: "participantName"
  }
*/


// Handle Express sessions
app.use(session({
    secret:'peterssecret',
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

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
});

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

app.use('/', index);
app.use('/users', users);

//POST method to create a chat message
app.post("/message", function(request, response) {
    console.log('POST to /message');
  //The request body expects a param named "message"
  var message = request.body.message;
    console.log(message);
  //If the message is empty or wasn't sent it's a bad request
  if(_.isUndefined(message) || _.isEmpty(message.trim())) {
    return response.status(400).json({error: "Message is invalid"});
  }
    //We also expect the sender's name with the message
  var name = request.body.name;

  //Let our chatroom know there was a new message
  io.sockets.emit("incomingMessage", {message: message, name: name});
  //Looks good, let the client know
  response.status(200).json({message: "Message received"});

});

/* Socket.IO events */
io.on("connection", function(socket){
    console.log('connection occurred');
    /*
        When a new user connects to our server, we expect an event called "newUser"
        and then we'll emit an event called "newConnection" with a list of all
        participants to all connected clients
    */
    socket.on("newUser", function(data) {
        participants.push({id: data.id, name: data.name});
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
    all participants with the id of the client that disconnected
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
    console.log('listening on port: ' + app.get('port'));
});

module.exports = app;
