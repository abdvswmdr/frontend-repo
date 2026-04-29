(function (){
  'use strict';

  const session    = require("express-session");
  const RedisStore = require('connect-redis')(session);

  const sessionSecret   = process.env.SESSION_SECRET || 'sooper secret';
  // Use COOKIE_SECURE=true only when HTTPS is in place — don't tie to NODE_ENV
  // because the site may run in production over plain HTTP (no cert-manager yet)
  const secureCookie = process.env.COOKIE_SECURE === 'true';

  const cookieOptions = {
    httpOnly: true,
    secure:   secureCookie,
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
