var express = require('express');
var router = express.Router();

module.exports = router;

/* GET Rickshaws page */
router.get('/', function(req, res) {
    res.render('rickshaws', {
        title: 'Rickshaws'
    });
});


