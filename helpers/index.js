(function () {
  "use strict";

  const request = require("request");
  const helpers = {};

  /* Public: errorHandler is a middleware that handles your errors
   *
   * Example:
   *
   * var app = express();
   * app.use(helpers.errorHandler);
   * */

  helpers.errorHandler = function (err, req, res, next) {
    const isDev = process.env.NODE_ENV !== "production";
    const ret = {
      message: err.message,
      ...(isDev && { error: err }),
    };
    res.status(err.status || 500).send(ret);
  };

  helpers.sessionMiddleware = function (req, res, next) {
    // This middleware previously wiped req.session.customerId if the cookie was missing.
    // We remove that destructive behavior to allow the session store to be the source of truth.
    next();
  };

  /* Responds with the given body and status 200 OK  */
  helpers.respondSuccessBody = function (res, body) {
    helpers.respondStatusBody(res, 200, body);
  };

  /* Public: responds with the given body and status
   *
   * res        - response object to use as output
   * statusCode - the HTTP status code to set to the response
   * body       - (string) the body to yield to the response
   */
  helpers.respondStatusBody = function (res, statusCode, body) {
    res.writeHeader(statusCode);
    res.write(body);
    res.end();
  };

  /* Responds with the given statusCode */
  helpers.respondStatus = function (res, statusCode) {
    res.writeHeader(statusCode);
    res.end();
  };

  /* Rewrites and redirects any url that doesn't end with a slash. */
  helpers.rewriteSlash = function (req, res, next) {
    if (req.url.substr(-1) === "/" && req.url.length > 1)
      res.redirect(301, req.url.slice(0, -1));
    else next();
  };

  /* Public: performs an HTTP GET request to the given URL
   *
   * url  - the URL where the external service can be reached out
   * res  - the response object where the external service's output will be yield
   * next - callback to be invoked in case of error. If there actually is an error
   *        this function will be called, passing the error object as an argument
   *
   * Examples:
   *
   * app.get("/users", function(req, res) {
   *   helpers.simpleHttpRequest("http://api.example.org/users", res, function(err) {
   *     res.send({ error: err });
   *     res.end();
   *   });
   * });
   */
  helpers.httpGet = function (url) {
    return new Promise(function (resolve, reject) {
      request.get(url, function (error, response, body) {
        if (error) return reject(error);
        resolve({
          status: response.statusCode || 200,
          body: body || "",
          contentType: response.headers["content-type"],
        });
      });
    });
  };

  helpers.httpRequest = function (options) {
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) return reject(error);
        const bodyStr =
          body !== null && typeof body === "object"
            ? JSON.stringify(body)
            : body || "";
        resolve({ status: response.statusCode, body: bodyStr });
      });
    });
  };

  helpers.simpleHttpRequest = async function (url, res, next) {
    try {
      const { status, body, contentType } = await helpers.httpGet(url);
      if (contentType) res.setHeader("Content-Type", contentType);
      helpers.respondStatusBody(res, status, body);
    } catch (err) {
      next(err);
    }
  };

  /* TODO: Add documentation */
  helpers.getCustomerId = function (req, env) {
    // Priority 1: Direct session value (authoritative for logged-in users)
    if (req.session && req.session.customerId) {
      return req.session.customerId;
    }

    // Priority 2: Development override
    if (env === "development" && req.query.custId != null) {
      return req.query.custId;
    }

    // Priority 3: Fallback to session ID for anonymous users (e.g. guest carts)
    if (req.session && req.session.id) {
      return req.session.id;
    }

    throw new Error("User not logged in and no session available.");
  };
  module.exports = helpers;
})();
