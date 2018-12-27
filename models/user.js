const ID = '(user.js) ';
var pg = require('pg');
var bcrypt = require('bcryptjs');
const saltRounds = 10;
const myPassword = 'the quick brown fox';
const anotherPassword = 'secretsquirrel';
var connect = 'postgres://pnfhritadoduvm:f73a4bd09f6e8e082106c675792a88519f64bc290c7c9c2b5e40511cfdedfa91@ec2-54-235-245-255.compute-1.amazonaws.com:5432/d1mboisolqqr3t';
pg.defaults.ssl = true;

// a currently unused function
function User(id, name, surname, nie, username, company, email, telephone, pass1, image, lastSeen, regDate, isApproved, isSuspended, access, mime){
    this.id=id;
    this.name=name;
    this.surname=surname;
    this.nie=nie;
    this.username=username;
    this.company=company;
    this.email=email;
    this.telephone=telephone;
    this.password=pass1;
    this.image=image;
    this.regDate=regDate;
    this.lastSeen=regDate;
    this.isApproved=isApproved;
    this.isSuspended=isSuspended;
    this.access=access;
    this.mime=mime;
}

module.exports = User;

module.exports.comparePassword = function (candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, res) {
        if (err) {return callback(err);}
        return callback(null, res);
    });
}


module.exports.insertUser = function (newUser, callback){
    var newUser = newUser;
    //create the connection to the database, then process the error or returned client
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log('\t' + ID + '!!! error trying to connnect to database !!!');
            return callback(error);
        }
        // hash the password
        bcrypt.genSalt (saltRounds, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                var hashedPass = hash;
                client.query("INSERT INTO public.members(name, surname, nie, username, company, email, telephone, password, image, regdate, lastseen, isapproved, issuspended, access, mime) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)", [newUser.name, newUser.surname, newUser.nie, newUser.username, newUser.company, newUser.email, newUser.telephone, hashedPass, newUser.image, newUser.regDate, newUser.lastSeen, newUser.isApproved, newUser.isSuspended, newUser.access, newUser.mime], function(err, result){
                    done();
                    if (err){
                        return callback(err);
                    }
                    console.log('\t' + ID + 'new Member added to database');
                    return callback(null, result);
                });
            });
        });
    });
};

// UPDATE public.members SET isapproved = true WHERE memberno = memberID;

module.exports.approveMember = function (memberId, callback){
    //create the connection to the database, then process the error or returned client
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log('!!! error trying to connnect to database !!!');
            return callback(error);
        }
        var query = "UPDATE public.members SET isapproved = 'true' WHERE memberno = '" + memberId + "'";
        client.query(query, function(err, result){
            done();
            if (err){
                return callback(err);
            }
            console.log('Member approval recorded in dB');
            return callback(null, result);
        });
    });
};

// returns TRUE or FALSE for a duplicate NIE check
module.exports.NieDuplicated = function (nie, callback){
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log(error);
            return callback(true);
        }
        var query = "(SELECT * FROM public.members WHERE LOWER(nie) = LOWER('" + nie + "'))";
        client.query(query, function(err, result){
            done();
            if(err){
                console.log(err);
                return callback(true);
            }
            if (result.rowCount == 0){
                return callback(false);
            }
            else{
                return callback(true);
            }
        return callback(null, result);
        });
    });
};

// returns TRUE or FALSE for a duplicate Username check
module.exports.UsernameDuplicated = function (username, callback){
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log(error);
            return callback(true);
        }
        var sql = "(SELECT * FROM public.members WHERE LOWER(username) = LOWER('" + username + "'))";
        client.query(sql, function(err, result){
            done();
            if(err){
                console.log(err);
                return callback(true);
            }
            if (result.rowCount == 0){
                return callback(false);
            }
            else{
                return callback(true);
            }
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
    console.log('\t\t' + ID + 'refreshing Members.....');
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
                        image:          membersSet[i].image, 
                        regDate:        new Date(membersSet[i].regdate),  
                        lastSeen:       new Date(membersSet[i].lastseen), 
                        isApproved:     membersSet[i].isapproved, 
                        isSuspended:    membersSet[i].issuspended,  
                        access:         membersSet[i].access
                        
                    });
                    //console.log(members[i].regDate);
                }
                console.log("\t\t\t"+ ID+ members.length + " Members in DB");
            
                return callback(null, members);
            }
            
        });
    });
};

module.exports.getUserById = function (id, callback){
    console.log('\t' + ID + 'Retrieving User by ID, connecting.....');
    pg.defaults.ssl = true;
    pg.connect(connect, function(error, client, done) {
        if (error) {
            console.log('\t' + ID + 'error during DB connection');
            return callback(error);
        }
        //console.log('   connected - querying database');
        var sql = "(SELECT * FROM public.members WHERE memberno = '" + id + "')";
        client.query(sql, function(err, result){
            done();
            if(err){
                console.log('\t' + ID + 'error during DB query');
            return callback(err);
            }
            if (result.rowCount == 0){
                console.log('\t' + ID + 'no match found for memberID');
            return callback(null, null);
            }
            if (result.rowCount == 1){
                //console.log("   1 match found");
            
                var userSet = JSON.stringify(result.rows, null, '    ');
                userSet = JSON.parse(userSet);
                var user = new User(userSet[0].memberno, userSet[0].name,  userSet[0].surname, userSet[0].nie, userSet[0].username,  userSet[0].company, userSet[0].email, userSet[0].telephone,  userSet[0].password, userSet[0].image, userSet[0].regdate,  userSet[0].lastseen, userSet[0].isapproved, userSet[0].issuspended,  userSet[0].access, userSet[0].mime);
                //console.log(user);
                return callback(null, user);
            }
            // THIS SHOULD NOT HAPPEN - THERE IS USERNAME DUPLICATION
            console.log('\t' + ID + 'DB error - duplication in MemberID field');
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
    



