var express = require('express');
var router = express.Router();
var http = require("http").createServer(router);
var io = require("socket.io").listen(http);

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
    res.redirect('/login');
}


module.exports = router;