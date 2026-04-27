(function (){
  'use strict';

  const express   = require("express")
  const request   = require("request")
  const endpoints = require("../endpoints")
  const helpers   = require("../../helpers")
  const app       = express()

  app.get("/catalogue/images*", function (req, res, next) {
    const url = endpoints.catalogueUrl + req.url.toString();
    request.get(url)
        .on('error', function(e) { next(e); })
        .pipe(res);
  });

  app.get("/catalogue*", function (req, res, next) {
    helpers.simpleHttpRequest(endpoints.catalogueUrl + req.url.toString(), res, next);
  });

  app.get("/tags", function(req, res, next) {
    helpers.simpleHttpRequest(endpoints.tagsUrl, res, next);
  });

  module.exports = app;
}());
