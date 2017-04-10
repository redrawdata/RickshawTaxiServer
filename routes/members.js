const ID = '(members.js) ';

var express = require('express');
var router = express.Router();
var onlineUsers = require('../app');
var http = require("http").createServer(router);
var io = require("socket.io").listen(http);
var User = require('../models/user');
var App = require('../app');
module.exports = router;

/* GET Members page. */
router.get('/', ensureAuthenticated, function(req, res) {
    // check if this route was accessed via a login, if so check for already online duplicates
    //if(req.wasALogin){}
    if(res.locals.user.access >= 15 && res.locals.user.access < 25){
        console.log('serving the members page for Owners');
        res.render('membersOwners', { 
                            title: 'Members',
                            user: req.user
        });
    }
    else if(res.locals.user.access > 5 && res.locals.user.access < 15){
        console.log('serving the members page for Riders');
        res.render('membersRiders', { 
                            title: 'Members',
                            user: req.user
        });
    }
    else if(res.locals.user.access <= 5){
        console.log('serving the members page for Admin');
        res.render('members', { 
                            title: 'Members',
                            user: req.user
        });
    }
});
/* GET a Member's photo. */
router.get('/photo', ensureAuthenticated, function(req, res) {
    // create any variables
    console.log('serving a members photo');
    console.log('reading file: ' + req.body.image + ", " + req.body.mime);
    fs.readFile('./uploads/' + req.body.image, function(err, image){
        if(err) {
            throw err;
            console.log("could not read file ");
        } //Fail if the file can't be read
        else{
            console.log("file read in: sending to client");
            res.writeHead(200, {'Content-Type':req.body.mime});
            res.end(image);
        }
    });
});

/* GET a refresh of Approvals for Admin User */
router.get('/refreshApprovals', ensureAuthenticated, function(req, res) {
    User.getApprovals(function(err, approvals){
        if (err){
            console.log("error refreshing Approvals" + err);
            res.send({approvals: null});
            next();
        }
        else{
            res.send({approvals: approvals});
        }
    });
    
    // create an
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
router.get('/logout', ensureAuthenticated, function(req, res){
    console.log('logging out the user');
    req.logout();
    req.flash('success','you have logged out');
    res.redirect('/login');
});

/* POST - co-ordinates of a browsing customer */
router.post('/positions', function(req, res){
    console.log(ID + 'Member coords received from...');
    var lat = req.body.position.coords.latitude;
    var lng = req.body.position.coords.longitude;
    var id = req.body.id;
    
    res.send({response:"Thanks for your position"});
    
});

/* POST - Administrator approves a new profile */
router.post('/approveMember', function(req, res){
    console.log(ID + 'Administration approval for memberID: ' + req.body.approvalId);
    var memberID = req.body.approvalId;
    //res.send({response:"Thanks for your position"});
    // Create User in DB    
    User.approveMember(memberID, function(err, result){
        if(err) {
            console.log('       Error during UPDATE in Members table: ' + err);
            res.redirect('/members');
            return;
        } 
        console.log('   Approval successful for memberID: '+memberID);
        // Success Message
        req.flash('success', 'Member Approved');
    
        // res.location('/');
        res.redirect('/members');
    });
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


