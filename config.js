(function (){
  'use strict';

  const session    = require("express-session");
  const RedisStore = require('connect-redis')(session);

  const sessionSecret = process.env.SESSION_SECRET || 'sooper secret';

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
