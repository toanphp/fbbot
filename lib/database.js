// var exports = module.exports = {};
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toan",
    database: "calendar"
});


exports.datlich = function(cid, name, time) {
    con.connect(function(err){
        if(err) throw err;
        var sql = "INSERT INTO date (cid, name, time, comment) VALUES(" + parseInt(cid) + ", '" + name + "', '" + time + "', 'afasfasfas')";
        con.query(sql, function(err, result) {
            if(err) throw err;
        });
    });
    throw new Error('day la loi');
}
