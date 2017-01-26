var express = require('express');
var router = express.Router();

module.exports = router;

/* GET Home page */
router.get('/', function(req, res, next) {
    console.log('serving the Home page');
    res.render('home', { title: 'Home' });
});


