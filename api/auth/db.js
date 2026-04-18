'use strict';

const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
    host:               process.env.MYSQL_HOST     || 'catalogue-db',
    user:               process.env.MYSQL_USER     || 'catalogue_user',
    password:           process.env.MYSQL_PASSWORD || 'default_password',
    database:           process.env.MYSQL_DATABASE || 'socksdb',
    waitForConnections: true,
    connectionLimit:    5,
});
