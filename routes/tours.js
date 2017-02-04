var express = require('express');
var router = express.Router();

module.exports = router;

/* GET Tours page */
router.get('/', function(req, res, next) {
    console.log('serving the Tours page');
    res.render('tours', {title: 'Tours'});
});


