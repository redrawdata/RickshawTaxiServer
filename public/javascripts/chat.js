const ID = '(chat.js) ';

function init() {
    console.log(ID+'Init occurred....');
    console.log(ID+'Reading ServerBaseURL for connection');
    var serverBaseUrl = document.domain;
    var markers = [];
    /*
    On 'init' we make a connection to the socket.IO server.
    Note Port of Server is 8080 and does not need to be set here
    */
    
    console.log(ID+'Connecting to server');
    var socket = io.connect(serverBaseUrl);

    //create a 'sessionID' variable for later use
    var sessionId = '';
    
    //Helper function - updates the Participants' list in the browser
    function updateParticipants(participants) {
        // clear the Participants list in the browser
        $('#participants').html('');
        // loop through each Participant and append a Span, their Name and (if the sessionId's match) the word 'You'
        for (var i = 0; i < participants.length; i++) {
            $('#participants').append('<span id="' + participants[i].id + '">' +
            participants[i].username + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
        }
        console.log('chat.js - Participants updated in browser');
    }
    
    /*
    When the Client successfully connects to the server, event "connect" is triggered.... here we have the opportunity to send a 'newUser' event to the Server and provide all relevant data of the Client
    */
    socket.on('connect', function () {
        // set the 'sessionId'
        sessionId = socket.io.engine.id;
        console.log(ID+'Connected as Session: ' + sessionId);
        console.log(ID+'emitting newUser Event to Server..');
        
        socket.emit('newUser', {id:         sessionId,
                                memberID:   user.id,
                                name:       user.name,
                                surname:    user.surname,
                                username:   user.username,
                                company:    user.company,
                                lat:        null,
                                lng:        null,
                                onRide:     'false'
                                // lat and lng
        });
    });
    
    
    /*
    When the server emits the "newConnection" event, we'll reset
    the participants section and display the connected clients.
    Note we are assigning the sessionId as the span ID.
    */
    socket.on('newConnection', function (data) {
        console.log('chat.js - newConnection');
        console.log('chat.js - updating Participants');
        updateParticipants(data.participants);
        // run test function
        addMarkers(data.participants);
        
        
    });

    /*
    When the server emits the "userDisconnected" event, we'll
    remove the span element from the participants element
    */
    socket.on('userDisconnected', function(data) {
        $('#' + data.id).remove();
    });

    /*
    When the server fires the "nameChanged" event, it means we
    must update the span with the given ID accordingly
    */
    socket.on('nameChanged', function (data) {
        $('#' + data.id).html(data.name + ' ' + (data.id === sessionId ? '(You)' : '') + '<br />');
    });
    
    
    /*
    When receiving a new coordinates message with the "incomingCoords" event,
    Update the Map Marker[id]
    */
    socket.on('incomingCoords', function (data) {
        console.log('new set of member coords received');
        adjustMarkers(data.participants);
        //$('#messages').prepend('<b>' + name + '</b><br />' + message + '<hr />');
    });

    
    /*
    When receiving a new chat message with the "incomingMessage" event,
    we'll prepend it to the messages section
    */
    socket.on('incomingMessage', function (data) {
        var message = data.message;
        var name = data.name;
        $('#messages').prepend('<b>' + name + '</b><br />' + message + '<hr />');
    });

    /*
    Log an error if unable to connect to server
    */
    socket.on('error', function (reason) {
        console.log('Unable to connect to server', reason);
    });

    /*
    "sendMessage" will do a simple ajax POST call to our server with
    whatever message we have in our textarea
    */
    function sendMessage() {
        var outgoingMessage = $('#outgoingMessage').val();
        var name = $('#name').val();
        $.ajax({
        url:  '/message',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({message: outgoingMessage, name: name})
        });
    }

    /*
    "sendCoords" will do a simple ajax POST call to our server with
    whatever coords we have in our textarea
    */
    function sendCoords(latitude, longitude, userID) {
        var outgoingLat = latitude;
        var outgoingLng = longitude;
        var id = userID;
        $.ajax({
        url:  '/coords',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({lat: outgoingLat, lng: outGoingLng, id: id})
        });
    }

    /*
    If user presses Enter key on textarea, call sendMessage if there
    is something to share
    */
    function outgoingMessageKeyDown(event) {
        if (event.which == 13) {
            event.preventDefault();
        if ($('#outgoingMessage').val().trim().length <= 0) {
            return;
        }
        sendMessage();
        $('#outgoingMessage').val('');
        }
    }

    /*
    Helper function to disable/enable Send button
    */
    function outgoingMessageKeyUp() {
        var outgoingMessageValue = $('#outgoingMessage').val();
        $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
    }

    /*
    When a user updates his/her name, let the server know by
    emitting the "nameChange" event
    */
    function nameFocusOut() {
        var name = $('#name').val();
        socket.emit('nameChange', {id: sessionId, name: name});
    }

    /* Elements setup */
    $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
    $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);
    $('#name').on('focusout', nameFocusOut);
    $('#send').on('click', sendMessage);
}

$(document).on('ready', init);