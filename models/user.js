var pg = require('pg');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPassword = 'the quick brown fox';
const anotherPassword = 'secretsquirrel';
var connect = 'postgres://uwjxdttsjukuaf:iy3dxdHuLJS2WQesI2Uo8odQBw@ec2-54-221-246-85.compute-1.amazonaws.com:5432/d3rjtprcvt17fs';
pg.defaults.ssl = true;

function User(name, surname, nie, username, company, email, telephone, pass1, image, lastSeen, regDate, isApproved, isSuspended, access){
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
}

module.exports = User;
// module.exports.getUserByUsername = function(){}

module.exports.comparePassword = function (candidatePassword, hash, callback){
    console.log('comparing passwords');
    bcrypt.compare(candidatePassword, hash, function(err, res) {
        if (err) {return callback(err);}
        return callback(null, res);
    });
}

module.exports.insertUser = function (newUser, callback){
    //create the connection to the database, then process the error or returned client
    pg.connect(connect, function(error, client) {
        if (error) {return callback(error);}
        // hash the password
        bcrypt.genSalt (saltRounds, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                var hashedPass = hash;
                client.query("INSERT INTO public.members(name, surname, nie, username, company, email, telephone, password, image, regdate, lastseen, isapproved, issuspended, access) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)", [newUser.name, newUser.surname, newUser.nie, newUser.username, newUser.company, newUser.email, newUser.telephone, hashedPass, newUser.image, newUser.regDate, newUser.lastSeen, newUser.isApproved, newUser.isSuspended, newUser.access], function(err, result){
                    if (err){return callback(err);}
                    console.log('/tnew Member added to database');
                    return callback(null, result);
                });
            });
        });
    });
};

// returns record which matches a given NIE
module.exports.getUserByNie = function (nie, callback){
    pg.connect(connect, function(error, client) {
        if (error) {return callback(error);}
        var sql = "(SELECT * FROM public.members WHERE LOWER(nie) = LOWER('" + nie + "'))";
        var query = client.query(sql, function(err, result){
            if(err){return callback(err);}
            return callback(null, result);
        });
    });
};

// returns record which matches a given Username
module.exports.getUserByUsername = function (username, callback){
    pg.connect(connect, function(error, client) {
        if (error) {return callback(error);}
        var sql = "(SELECT * FROM public.members WHERE LOWER(username) = LOWER('" + username + "'))";
        var query = client.query(sql, function(err, result){
            if(err){return callback(err);}
            return callback(null, result);
        });
    });
};


module.exports.getUserById = function (id, callback){
    pg.connect(connect, function(error, client) {
        if (error) {return callback(error);}
        var sql = "(SELECT * FROM public.members WHERE memberno = '" + id + "')";
        var query = client.query(sql, function(err, result){
            if(err){return callback(err);}
            var user = JSON.stringify(result.rows, null, '    ');
            user = JSON.parse(user);
            user.id = user[0].memberno;
            return callback(null, user);
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
    



