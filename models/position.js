const ID = '(position.js) ';
var pg = require('pg');

var connect = 'postgres://pnfhritadoduvm:f73a4bd09f6e8e082106c675792a88519f64bc290c7c9c2b5e40511cfdedfa91@ec2-54-235-245-255.compute-1.amazonaws.com:5432/d1mboisolqqr3t';
pg.defaults.ssl = true;

// a currently unused function
function Position(id, memberId, date, time, lat, lng, comment){
    this.id=id;
    this.memberId=memberId;
    this.date=date;
    this.time=time;
    this.lat=lat;
    this.lng=lng;
    this.comment=comment;
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
                        date:        positionsSet[i].date, 
                        time:            positionsSet[i].time, 
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


module.exports.insertPosition = function (newPosition, callback){
    
    // check table size and do something if it is approaching its limit
    
    console.log(ID + newPosition);
    //create the connection to the database, then process the error or returned client
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log('!!! error trying to connnect to database !!!');
            return callback(error);
        }
        // hash the password
        client.query("INSERT INTO public.positions(memberid, date, time, latitude, longitude, comment) VALUES($1, $2, $3, $4, $5, $6)", [newPosition.memberId, newPosition.date, newPosition.time, newPosition.lat, newPosition.lng, newPosition.comment], function(err, result){
            done();
            if (err){
                return callback(err);
            }
            console.log('new Position added to database');
            return callback(null, result);
        });
    });
};

// returns record which matches a given NIE
module.exports.getUserByNie = function (nie, callback){
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            return callback(error);
        }
        var sql = "(SELECT * FROM public.members WHERE LOWER(nie) = LOWER('" + nie + "'))";
        client.query(sql, function(err, result){
            done();
            if(err){
                return callback(err);
            }
            if (result.rowCount == 0){
                return callback(null, null);
            }
            if (result.rowCount == 1){
                var userSet = JSON.stringify(result.rows, null, '    ');
                userSet = JSON.parse(userSet);
                var user = new User(userSet[0].memberno, userSet[0].name,  userSet[0].surname, userSet[0].nie, userSet[0].username,  userSet[0].company, userSet[0].email, userSet[0].telephone,  userSet[0].password, userSet[0].image, userSet[0].regdate,  userSet[0].lastseen, userSet[0].isapproved, userSet[0].issuspended,  userSet[0].access, userSet[0].mime);
                return callback(null, user);
            }
            // THIS SHOULD NOT HAPPEN - THERE IS USERNAME DUPLICATION
            console.log('DB error - duplication in Username field');
            return callback(null, null);
        });
    });
};

// returns record(s) which match a given Username
module.exports.getUserByUsername = function (username, callback){
    pg.defaults.ssl = true;
    // connect to dB
    pg.connect(connect, function(error, client, done) {
        if (error) {
            // connection error
            return callback(error);
        }
        // connection good - prepare SQL
        var sql = "(SELECT * FROM public.members WHERE LOWER(username) = LOWER('" + username + "'))";
        // query dB
        client.query(sql, function(err, result){
            
            done(); //
            if(err){
                return callback(err);
            }
            if (result.rowCount == 0){
                return callback(null, null);
            }
            if (result.rowCount == 1){
                var userSet = JSON.stringify(result.rows, null, '    ');
                userSet = JSON.parse(userSet);
                var user = new User(userSet[0].memberno, userSet[0].name,  userSet[0].surname, userSet[0].nie, userSet[0].username,  userSet[0].company, userSet[0].email, userSet[0].telephone,  userSet[0].password, userSet[0].image, userSet[0].regdate,  userSet[0].lastseen, userSet[0].isapproved, userSet[0].issuspended,  userSet[0].access, userSet[0].mime);
                return callback(null, user);
            }
            // THIS SHOULD NOT HAPPEN - THERE IS USERNAME DUPLICATION
            console.log('DB error - duplication in Username field');
            return callback(null, null);
        });
    });
};

// returns all Member record(s)
module.exports.getAllMembers = function (allMembers, callback){
    console.log('\t\t'+ID+'refreshing Members.....');
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            var members = [];
            return callback(error, members);
        }
        var sql = "(SELECT " + allMembers + " FROM public.members)";
        client.query(sql, function(err, result){
            done();
            if(err){
                console.log('       DB error during query - ' + err);
                var members = [];
                return callback(error, members);
            
            }
            if (result.rowCount == 0){
                console.log("       no Members found in DB");
                var members = [];
                return callback(null, members);
            }
            if (result.rowCount > 0){
                var members = [];
                var membersSet = JSON.stringify(result.rows, null, '    ');
                membersSet = JSON.parse(membersSet);
                for (i = 0; i < result.rowCount; i++){
                    members.push({
                        id:             membersSet[i].memberno, 
                        name:           membersSet[i].name,  
                        surname:        membersSet[i].surname, 
                        nie:            membersSet[i].nie, 
                        username:       membersSet[i].username,  
                        company:        membersSet[i].company, 
                        email:          membersSet[i].email, 
                        telephone:      membersSet[i].telephone,  
                        password:       membersSet[i].password, 
                        image:          membersSet[i].image, 
                        regdate:        membersSet[i].regdate,  
                        lastSeen:       membersSet[i].lastseen, 
                        isApproved:     membersSet[i].isapproved, 
                        isSuspended:    membersSet[i].issuspended,  
                        access:         membersSet[i].access, 
                        mime:           membersSet[i].mime
                        
                    });
                    console.log(members[i].username);
                }
                console.log("\t\t\t"+ ID+ members.length + " Members in DB");
            
                return callback(null, members);
            }
            
        });
    });
};

module.exports.getUserById = function (id, callback){
    console.log('Retrieving User by ID, connecting.....');
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log("   error during DB connection");
            return callback(error);
        }
        console.log('   connected - querying database');
        var sql = "(SELECT * FROM public.members WHERE memberno = '" + id + "')";
        client.query(sql, function(err, result){
            done();
            if(err){
                console.log("   error during DB query");
            return callback(err);
            }
            if (result.rowCount == 0){
                console.log("   no match found for memberID");
            return callback(null, null);
            }
            if (result.rowCount == 1){
                console.log("   1 match found");
            
                var userSet = JSON.stringify(result.rows, null, '    ');
                userSet = JSON.parse(userSet);
                var user = new User(userSet[0].memberno, userSet[0].name,  userSet[0].surname, userSet[0].nie, userSet[0].username,  userSet[0].company, userSet[0].email, userSet[0].telephone,  userSet[0].password, userSet[0].image, userSet[0].regdate,  userSet[0].lastseen, userSet[0].isapproved, userSet[0].issuspended,  userSet[0].access, userSet[0].mime);
                return callback(null, user);
            }
            // THIS SHOULD NOT HAPPEN - THERE IS USERNAME DUPLICATION
            console.log('DB error - duplication in MemberID field');
            return callback(null, null);
        });
    });    
};        

//query.on("row", function (row, user) {
//    result.addRow(row);
//});

//query.on("end", function (result) {
//    console.log(JSON.stringify(result.rows, null, "    "));
//    client.end();
//    return callback(null, result);
//});
    



