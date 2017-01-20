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

module.exports.comparePassword = function (candidatePassword, userPassword, callback){
    console.log('comparing passwords');
    console.log(candidatePassword +'    '+ userPassword);
    if(candidatePassword == userPassword){
        console.log('passwords match');
        return callback(null, true);
    }
    console.log('passwords do not match');
    return callback(null, false);
}

module.exports.insertUser = function (newUser, callback){
    
    pg.connect(connect, function(error, client) {
        
        if (error) {
            console.error('Problem connecting to Postgres: ' + error);
            return callback(error);
        }
        // hash the password
        console.log('Connected to Postgres...Attempting INSERT');
        bcrypt.genSalt (saltRounds, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                var hashedPass = hash;
                client.query("INSERT INTO public.members(name, surname, nie, username, company, email, telephone, password, image, regdate, lastseen, isapproved, issuspended, access) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)", [newUser.name, newUser.surname, newUser.nie, newUser.username, newUser.company, newUser.email, newUser.telephone, hashedPass, newUser.image, newUser.regDate, newUser.lastSeen, newUser.isApproved, newUser.isSuspended, newUser.access], function(err, result){
                    if (err){
                        console.log('PostgreSQL Failed: ' + err);
                        return callback(err);
                    }
                    console.log('new Member added to database');
                    console.log(result);
                    return callback(null, result);
                });
            });
        });
    });
};

module.exports.getUserByUsername = function (username, callback){
    
    pg.connect(connect, function(error, client) {
        //console.log(User.name);
        if (error) {
            console.error('Problem connecting to Postgres: ' + error);
            return callback(error);
        }
        console.log('Connected to Postgres...Attempting SELECT');
        var sql = "(SELECT * FROM public.members WHERE username = '" + username + "')";
        console.log(sql);
        var query = client.query(sql, function(err, result){
            console.log(result);
            if(err){
                console.log('error during SELECT: ' + err);
                
            }
            if(result.rowCount == 0){
                console.log('No Username matched');
                return callback(null, false);
            }
            if(result.rowCount == 1){
                var user = JSON.stringify(result.rows, null, '    ');
                user = JSON.parse(user);
                console.log(user);
                console.log(user[0].memberno);
                return callback(null, user);
            }
            if(result.rowCount > 1){
                console.log('There is Username duplication in your database');
            }
            
        });
        //query.on("row", function (row, user) {
        //    result.addRow(row);
        //});

        //query.on("end", function (result) {
        //    console.log(JSON.stringify(result.rows, null, "    "));
        //    client.end();
        //    return callback(null, result);
        //});
    });
    
    
    
};
module.exports.getUserById = function (id, callback){
    
    pg.connect(connect, function(error, client) {
        //console.log(User.name);
        if (error) {
            console.error('Problem connecting to Postgres: ' + error);
            return callback(error);
        }
        console.log('Connected to Postgres...Attempting SELECT');
        var sql = "(SELECT * FROM public.members WHERE memberno = '" + id + "')";
        console.log(sql);
        var query = client.query(sql, function(err, result){
            if(err){
                console.log('error during SELECT: ' + err);
                
            }
            if(result.rowCount == 1){
                var user = JSON.stringify(result.rows, null, '    ');
                user = JSON.parse(user);
                console.log(user);
                console.log(user[0].memberno);
                user.id = user[0].memberno;
                    
                return callback(null, user);
            }
            if(result.rowCount > 1){
                console.log('There is Username duplication in your database');
            }
            
        });
        //query.on("row", function (row, user) {
        //    result.addRow(row);
        //});

        //query.on("end", function (result) {
        //    console.log(JSON.stringify(result.rows, null, "    "));
        //    client.end();
        //    return callback(null, result);
        //});
    });
    
    
    
};