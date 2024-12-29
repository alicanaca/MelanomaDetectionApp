const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost", // Veritabanı sunucusunun adresi
    user: "root", // MySQL kullanıcı adı
    password: "1230", // MySQL şifresi
    database: "melanoma_app", // Veritabanı adı
});

const promisePool = pool.promise(); // Promise tabanlı sorgular için

module.exports = promisePool;
