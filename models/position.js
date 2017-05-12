const ID = '(position.js) ';
var pg = require('pg');

var connect = 'postgres://pnfhritadoduvm:f73a4bd09f6e8e082106c675792a88519f64bc290c7c9c2b5e40511cfdedfa91@ec2-54-235-245-255.compute-1.amazonaws.com:5432/d1mboisolqqr3t';
pg.defaults.ssl = true;

// a currently unused function
function Position(id, memberId, type, lat, lng, date, comment, visibleToOwner){
    this.id=id;
    this.memberId=memberId;
    this.type=type;
    this.lat=lat;
    this.lng=lng;
    this.date=date;
    this.comment=comment;
    this.visible=visibleToOwner;
}

module.exports = Position;

// returns all Member record(s)
module.exports.getAllPositions = function (allPositions, callback){
    console.log('\t\t'+ID+'refreshing Positions.....');
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            var positions = [];
            return callback(error, positions);
        }
        var sql = "(SELECT " + allPositions + " FROM public.positions)";
        client.query(sql, function(err, result){
            done();
            if(err){
                console.log('       DB error during query - ' + err);
                var positions = [];
                return callback(error, positions);
            
            }
            if (result.rowCount == 0){
                console.log("       no Positions found in DB");
                var positions = [];
                return callback(null, positions);
            }
            if (result.rowCount > 0){
                var positions = [];
                var positionsSet = JSON.stringify(result.rows, null, '    ');
                positionsSet = JSON.parse(positionsSet);
                for (i = 0; i < result.rowCount; i++){
                    positions.push({
                        id:             positionsSet[i].id, 
                        memberId:           positionsSet[i].memberid,  
                        date:        new Date(positionsSet[i].date), 
                        time:            new Date(positionsSet[i].time), 
                        lat:       positionsSet[i].latitude,  
                        lng:        positionsSet[i].longitude, 
                        comment:          positionsSet[i].comment
                        
                    });
                    // console.log(positions[i].memberId);
                }
                console.log("\t\t\t"+ ID+ positions.length + " Positions in DB");
            
                return callback(null, positions);
            }
            
        });
    });
};


module.exports.addAPosition = function (newPosition, callback){
    
    // check table size and do something if it is approaching its limit
    
    //create the connection to the database, then process the error or returned client
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log('!!! error trying to connnect to database !!!');
            return callback(error);
        }
        console.log('Cnnnected to db - performing SQL');
        client.query("INSERT INTO public.positions(memberid, date, type, latitude, longitude, comment, visibletoowner) VALUES($1, $2, $3, $4, $5, $6, $7)", [newPosition.memberId, Date.parse(newPosition.date), newPosition.type, newPosition.lat, newPosition.lng, newPosition.comment, newPosition.visible], function(err, result){
            done();
            if (err){
                console.log('SQL error');
                return callback(err);
            }
            console.log('new Position added to database');
            console.log(result);
            var newPosition = JSON.stringify(result.rows, null, '    ');
            newPosition = JSON.parse(newPosition);
            
            return callback(null, newPosition);
        });
    });
};

