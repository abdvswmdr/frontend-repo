(function (){
  'use strict';

  const session    = require("express-session");
  const RedisStore = require('connect-redis')(session);

  const sessionSecret = process.env.SESSION_SECRET || 'sooper secret';
  const isProduction  = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure:   isProduction,
    sameSite: 'lax',
    maxAge:   86400000
  };

  module.exports = {
    session: {
      name:              'sid',
      secret:            sessionSecret,
      resave:            false,
      saveUninitialized: false,
      cookie:            cookieOptions
    },

    session_redis: {
      store:             new RedisStore({host: "session-db"}),
      name:              'sid',
      secret:            sessionSecret,
      resave:            false,
      saveUninitialized: false,
      cookie:            cookieOptions
    }
  };
}());
