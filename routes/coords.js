var express = require('express');
var router = express.Router();
module.exports = router;

/* POST - co-ordinates of a browsing customer */
router.post('/', function(req, res){
    console.log('Receiving browser co-ords. Lat :' + req.body.position.coords.latitude + ' - Lng :' + req.body.position.coords.longitude + ' from ' + req.body.id);
    res.send({response:"Thanks for your position"});
    
});


