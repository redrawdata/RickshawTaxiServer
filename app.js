const ID = "(app.js) "; // file name here for logging/debug purposes
console.log(ID + 'Started.... setting up environment....');
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
var _ = require("underscore");
console.log('\t' + ID + '...Node-Modules acquired');
var test = 'test passed';
var app = express();

// provision for a socket.io server
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);

//provision access to Models
var User = require('./models/user');
var Position = require('./models/position');
console.log('\t' + ID + '...Server created and Socket.io');

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
var coords = require('./routes/coords');
console.log('\t' + ID + '...Routing variables set');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
console.log('\t' + ID + '...View Engine is ' + app.get('view engine'));

// set environment
app.set('port', process.env.PORT || 8080);
console.log('\t' + ID + '...Port set to: ' + app.get('port'));

// setup middleware
console.log('\t' + ID + '...Configuring Middleware...');
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

console.log('\t\t' + ID + '...Middleware configured');

// HELPER FUNCTIONS ***********************************************************

/*
this will happen before every GET and POST request, it sets a 
Global Variable called 'messages' which allows....
*/
app.use(function (req, res, next) {
    console.log('                                    ');
    console.log(ID + 'collecting Express messages');
    res.locals.messages = require('express-messages')(req, res);
    next();
});

/*
this will happen before every GET request, it sets a 
Global Variable called 'user' which allows checking of
the 'user' state
*/
app.get('*', function (req, res, next){
    console.log(ID + 'making Global Variables available');
    res.locals.participants = [];
    res.locals.members = [];
    res.locals.positions = [];
    res.locals.user = req.user || null;
    if (res.locals.user){
        console.log('\t' + ID + 'User logged in (Level: ' + res.locals.user.access + ')');
        res.locals.participants = participants;
        next();
        /*
        User.getAllMembers('*', function(err, allMembers){
            if (err){
                console.log('error refreshing Members');
            }
            console.log('\t\t' + ID + '...Members refreshed');
            members = allMembers;
            res.locals.members = members;
            console.log('\t\t\t' + ID + 'Members = ' + members.length);
            Position.getAllPositions('*', function(error, allPositions){
                if (error){
                    console.log('error refreshing Positions');
                }
                console.log('\t\t' + ID + '...Positions refreshed');
                positions = allPositions;
                res.locals.positions = positions;
                console.log('\t\t\t' + ID + 'Positions = ' + positions.length);
                
                res.locals.participants = participants;
                
                
                console.log('\t\t' + ID + 'Participants    = ' + res.locals.participants.length);
                console.log('\t\t' + ID + 'Members         = ' + res.locals.members.length);
                console.log('\t\t' + ID + 'Positions         = ' + res.locals.positions.length);
                next();
            });
        });
        */
    }
    else {
        
        console.log('\t' + ID + 'No User Info - Not logged in');
        //console.log('\t\t' + ID + 'Participants    = ' + res.locals.participants.length);
        //console.log('\t\t' + ID + 'Members         = ' + res.locals.members.length);
        next();
    }
    
});


// FOR TESTING - adds 'fake' online members
function addFakeParticipants(){
    console.log('\t' + ID + '...adding fake online members...');
    participants.push({
        id:         'bvhfgonhgoshnggo',
        memberID:   '100',
        name:       'fake1',
        surname:    'member1',
        username:   'Fake 1',
        company:    'Funky Cycle',
        lat:        '41.408',
        lng:        '2.17',
        onRide:     'false'
    });
    participants.push({
        id:         'hrntvthlshtlsnt', 
        memberID:   '101',
        name:       'earthquake',
        surname:    'shaker',
        username:   'Quaker',
        company:    'Funky Cycle',
        lat:        '41.4081',
        lng:        '2.171',
        onRide:     'false'
    });
    participants.push({
        id:         'ssnyytmtmaymym', 
        memberID:   '102',
        name:       'fake3',
        surname:    'member3',
        username:   'Fake 3',
        company:    'Trixi',
        lat:        '41.408',
        lng:        '2.171',
        onRide:     'false'
    });
    participants.push({
        id:         'alryqvlrvybblriy', 
        memberID:   '103',
        name:       'earthquake2',
        surname:    'shaker2',
        username:   'Quaker2',
        company:    'Trixi',
        lat:        '41.4081',
        lng:        '2.17',
        onRide:     'false'
    });
}

// ********************************************************* HELPER FUNCTIONS

// Socket.io methods *********************************************************
members
//POST method to create a chat message
app.post("/message", function(request, response) {
    console.log(ID + 'POST to /message');
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

//POST method to receive member Coordinates
app.post("/coords", function(request, response) {
    console.log(ID + 'POST to /coords');
    //The request body expects a param named "lat", "lng" and "id"
    var lat = request.body.lat;
    var lng = request.body.lng;
    var id = request.body.id;
    console.log(id);
    console.log(lat);
    console.log(lng);
    console.log(participants.length + ' online');
    for (i = 0; i < participants.length; i++){
        console.log(participants[i].id + '\t' + participants[i].memberID + '\t' + participants[i].name);
    }
    // update the Participant[id] lat and lng
    for (i = 0; i < participants.length; i++){
        console.log('Participant ' + i + ' ID:' + participants[i].memberID + '('+id+')');
        if(participants[i].memberID == id){
            participants[i].lat=lat;
            participants[i].lng=lng;
            console.log('participant has location updated');
        }
        
    }
    
    //Emit the new coords to all Participants (.sockets)
    io.sockets.emit("incomingCoords", {participants: participants});
    //Looks good, let the client know
    response.status(200).json({message: "Coordinates received"});

});

// Handler for Socket.IO events

/* Connection event - occurs when the User(Client) becomes a 'live' User
    by attempting a socket.io connection to the Server*/
io.on("connection", function(socket){
    
    console.log(ID + 'A connection has occurred....');
    
    //Helper function to console.log the current Participants
    function logParticipants(){
        console.log('Current PAarticipants');   
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
        console.log('Server notified of a newUser...memberID: '+data.memberID);
        // loop through the participants and check for duplicate memberID
        for (i = 0; i < participants.length; i++){
            if (participants[i].memberID == data.memberID){
                // remove matching participant
                io.sockets.emit("userDisconnected", participants[i].id);
                participants.splice(i,1);
                console.log('memberID: '+data.memberID+' has connected again - previous memberssession removed');
            }
        }
        // add the newUser to the Participants list
        participants.push({ id:         data.id,
                            memberID:   data.memberID,
                            name:       data.name,
                            surname:    data.surname,
                            username:   data.username,
                            company:    data.company,
                            lat:        data.lat,
                            lng:        data.lng,
                            onRide:     data.onRide
        });
        console.log('Participants    = ' + participants.length);
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

// ********************************************************* Socket.io methods


// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// set the Routings
app.use('/', home);
app.use('/rickshaws', rickshaws);
app.use('/tours', tours);
app.use('/bookings', bookings);
app.use('/about', about);
app.use('/register', register);
app.use('/login', login);
app.use('/members', members);
app.use('/contact', contact);
app.use('/allpositions', coords);
console.log('\t' + ID + '...Routings set');

// set any program data here
var participants = [];
var members = [];
var positions = [];

addFakeParticipants();
console.log('\t' + ID + '...fake Participants = ' + participants.length);

// Update dynamic variables
console.log('\t' + ID + '...Updating dynamic variables...');
Position.getAllPositions('*', function(error, allPositions){
    positions = allPositions;
    User.getAllMembers('*', function(err, allMembers){
        members = allMembers;
        //console.log('\t\t\t' + ID + 'Members = ' + members.length);
        
        //Start the http server at port and IP defined before
        http.listen(app.get('port'), function(){
            console.log('\t' + ID + '...listening on port: ' + app.get('port'));
            console.log('\t');
        });
    });
});

//var aDate = new Date(0);
//console.log(aDate);
//var bDate = new Date(1000*60*60*24*365);
//console.log(bDate);
//var now = new Date();
//var nowVal = Date.parse(now);
//console.log(now);
//console.log(nowVal);
//console.log(new Date(nowVal));

module.exports = app;
module.exports = io;
module.exports = http;
