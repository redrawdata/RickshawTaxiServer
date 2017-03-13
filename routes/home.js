const ID = '(home.js) ';
var express = require('express');
var router = express.Router();
module.exports = router;

/* GET Home page */
router.get('/', function(req, res) {
    console.log(ID + 'Serving Home page');
    res.render('home', { 
        title: 'Home' 
    });
});


