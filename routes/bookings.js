var express = require('express');
var router = express.Router();

module.exports = router;

/* GET Bookings page */
router.get('/', function(req, res) {
    console.log('serving the Bookings page');
    res.render('bookings', {title: 'Bookings'});
});


