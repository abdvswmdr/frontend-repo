(function (){
  'use strict';

  var session      = require("express-session"),
      RedisStore   = require('connect-redis')(session)

  var sessionSecret = process.env.SESSION_SECRET || 'sooper secret';

  module.exports = {
    session: {
      name: 'md.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true
    },

    session_redis: {
      store: new RedisStore({host: "session-db"}),
      name: 'md.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true
    }
  };
}());
