const express      = require("express")
const helmet       = require("helmet")
const morgan       = require("morgan")
const bodyParser   = require("body-parser")
const cookieParser = require("cookie-parser")
const session      = require("express-session")
const config       = require("./config")
const helpers      = require("./helpers")
const cart         = require("./api/cart")
const catalogue    = require("./api/catalogue")
const orders       = require("./api/orders")
const user         = require("./api/user")
const metrics      = require("./api/metrics")
const app          = express();
app.set('trust proxy', 1);

app.use(function(req, res, next) {
    console.log('TRACE:', req.method, req.url);
    next();
});

// TODO: re-enable CSP once cross-browser product loading is diagnosed
// (inline event handlers in dynamic HTML cards may need migrating to delegated listeners first)
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc:              ["'self'"],
//       scriptSrc:               ["'self'", "https://js.honeybadger.io"],
//       styleSrc:                ["'self'", "'unsafe-inline'", "https:"],
//       imgSrc:                  ["'self'", "data:"],
//       connectSrc:              ["'self'", "https://api.honeybadger.io"],
//       fontSrc:                 ["'self'", "https:", "data:"],
//       objectSrc:               ["'none'"],
//       baseUri:                 ["'self'"],
//       formAction:              ["'self'"],
//       frameAncestors:          ["'self'"],
//       upgradeInsecureRequests: null
//     }
//   }
// }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static("public"));
if(process.env.SESSION_REDIS) {
    console.log('Using the redis based session manager');
    app.use(session(config.session_redis));
}
else {
    console.log('Using local session manager');
    app.use(session(config.session));
}

app.use(bodyParser.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(helpers.sessionMiddleware);
app.use(morgan("dev", {}));

let domain = "";
process.argv.forEach(function (val, index, array) {
  const arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] === "--domain") {
      domain = arg[1];
      console.log("Setting domain to:", domain);
    }
  }
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

process.on('unhandledRejection', function(reason, promise) {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

const server = app.listen(process.env.PORT || 8079, function () {
  const port = server.address().port;
  console.log("App now running in %s mode on port %d", app.get("env"), port);
});

process.on('SIGTERM', function() {
  server.close(function() {
    process.exit(0);
  });
});
