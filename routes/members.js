var express = require('express');
var router = express.Router();
var onlineUsers = require('../app');
var http = require("http").createServer(router);
var io = require("socket.io").listen(http);

module.exports = router;

/* GET Members page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
    // create any variables
    console.log('serving the members page');
    console.log('Participants = ' + res.locals.participants.length);
    for (i=0; i < res.locals.participants.length; i++){
        console.log('Participant ' + i + ' is ' + res.locals.participants[i].name);
    }
    res.render('members', { 
                            title: 'Members'
    });
});

/* GET - Logout request */
router.get('/logout', ensureAuthenticated, function(req, res, next){
    console.log('logging out the user');
    req.logout();
    req.flash('success','you have logged out');
    res.redirect('/login');
});

//POST method to create a chat message
router.post("/message", function(request, response) {
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


function ensureAuthenticated(req, res, next){
    console.log('seeking Authority for access to Members Page...');
    if(req.isAuthenticated()){
        console.log('   granted');
        return next();
    }
    console.log('   denied - redirectiog to Login Page');
    res.redirect('/login');
}


