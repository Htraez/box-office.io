const mysql = require('mysql');

const mysql_connection = mysql.createConnection({
    host     : '85.10.205.173',
    user     : 'boxoffice_admin',
    password : '11121150',
    database : 'db_boxoffice_io'
});

mysql_connection.connect();

const connect = (query) => {
    return new Promise(function(resolve, reject){
        
        mysql_connection.query(query, (err, rows, fields)=>{
            if(err){
                //console.log(err);
                if(err.code==='ECONNRESET'){
                    console.log(query);
                    //renew();
                }
                else reject(err);
            }
            resolve({
                rows: rows,
                fields: fields
            });
            //mysql_connection.end();
        });
        
    });
}

module.exports = {connect: connect};

// ==== MySQL DB @ db4free.net ====
// host: 85.10.205.173 or db4free.net
// phpMyAdmin: https://www.db4free.net/phpMyAdmin/
// Database: db_boxoffice_io
// Username: boxoffice_admin
// Email: htraexd@gmail.com
// ================================