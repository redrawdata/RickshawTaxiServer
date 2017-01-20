var express = require('express');
var router = express.Router();
var http = require("http").createServer(router);
var io = require("socket.io").listen(http);
var participants = [];

/* GET Members page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('members', { title: 'Members' });
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
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

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

//Start the http server at port and IP defined before
http.listen(8080, "127.0.0.1");

module.exports = router;