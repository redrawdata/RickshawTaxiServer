var express = require('express');
var router = express.Router();

module.exports = router;

/* GET Rickshaws page */
router.get('/', function(req, res, next) {
    console.log('serving the Rickshaws page');
    res.render('rickshaws', {title: 'Rickshaws'});
});


