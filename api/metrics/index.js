(function (){
  'use strict';

  const express = require("express")
  const client  = require('prom-client')
  const app     = express()

  const metric = {
    http: {
      requests: {
        duration: new client.Histogram('request_duration_seconds', 'request duration in seconds', ['service', 'method', 'route', 'status_code']),
      }
    }
  }

  function s(start) {
    const diff = process.hrtime(start);
    return (diff[0] * 1e9 + diff[1]) / 1000000000;
  }

  function observe(method, path, statusCode, start) {
    const route = path.toLowerCase();
    if (route !== '/metrics' && route !== '/metrics/') {
        const duration = s(start);
        const lowerMethod = method.toLowerCase();
        metric.http.requests.duration.labels('front-end', lowerMethod, route, statusCode).observe(duration);
    }
  }

  function middleware(request, response, done) {
    const start = process.hrtime();

    response.on('finish', function() {
      observe(request.method, request.path, response.statusCode, start);
    });

    return done();
  }

  app.use(middleware);
  app.get("/metrics", function(req, res) {
      res.header("content-type", "text/plain");
      return res.end(client.register.metrics())
  });

  module.exports = app;
}());
