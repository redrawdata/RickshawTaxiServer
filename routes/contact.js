var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

module.exports = router;

/* GET Contact Us page */
router.get('/', function(req, res) {
    console.log('serving the Contact Us page');
    res.render('contact', {title: 'Contact'});
});

router.post('/send', function(req, res){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'redrawdata@gmail.com',
            pass: 'milton10'
        }
    });
    
    var mailOptions = {
        from:'John Doe <johndoe@outlook.com',
        to:'redrawdata@gmail.com',
        subject:'Website Submission',
        text:'You have a new submission with the following details....Name: ' + req.body.name + ' Email: ' + req.body.email + ' Message: ' + req.body.message,
        html:'<p>You got a new submission with the following details...</p><ul><li>Name: ' + req.body.name +'</li><li>Email: ' + req.body.email + '</li><li>Message: ' + req.body.message + '</li></ul>'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.redirect('/');
        }
        else{
            console.log('Message Sent: '+info.response);
            res.redirect('/');
        }
    });
});


