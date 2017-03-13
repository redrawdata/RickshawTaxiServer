var express = require('express');
var router = express.Router();

module.exports = router;

/* GET About page */
router.get('/', function(req, res) {
    console.log('serving the About Us page');
    res.render('about', {title: 'About'});
});


