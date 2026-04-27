(function (){
  'use strict';

  const async     = require("async")
  const express   = require("express")
  const request   = require("request")
  const endpoints = require("../endpoints")
  const helpers   = require("../../helpers")
  const app       = express()

  app.get("/orders", function (req, res, next) {
    console.log("Request received with body: " + JSON.stringify(req.body));
    const logged_in = req.cookies.logged_in;
    if (!logged_in) {
      return next(new Error("User not logged in."));
    }

    const custId = req.session.customerId;
    async.waterfall([
        function (callback) {
          request(endpoints.ordersUrl + "/orders/search/customerId?sort=date&custId=" + custId, function (error, response, body) {
            if (error) {
              return callback(error);
            }
            console.log("Received response: " + JSON.stringify(body));
            if (response.statusCode === 404) {
              console.log("No orders found for user: " + custId);
              return callback(null, []);
            }
            callback(null, JSON.parse(body)._embedded.customerOrders);
          });
        }
    ],
    function (err, result) {
      if (err) {
        return next(err);
      }
      helpers.respondStatusBody(res, 201, JSON.stringify(result));
    });
  });

  app.get("/orders/*", function (req, res, next) {
    const url = endpoints.ordersUrl + req.url.toString();
    request.get(url).pipe(res);
  });

  app.post("/orders", function(req, res, next) {
    console.log("Request received with body: " + JSON.stringify(req.body));
    const logged_in = req.cookies.logged_in;
    if (!logged_in) {
      return next(new Error("User not logged in."));
    }

    const custId = req.session.customerId;

    async.waterfall([
        function (callback) {
          request(endpoints.customersUrl + "/" + custId, function (error, response, body) {
            if (error || body.status_code === 500) {
              callback(error);
              return;
            }
            console.log("Received response: " + JSON.stringify(body));
            const jsonBody = JSON.parse(body);
            const customerlink = jsonBody._links.customer.href;
            const addressLink = jsonBody._links.addresses.href;
            const cardLink = jsonBody._links.cards.href;
            const order = {
              "customer": customerlink,
              "address": null,
              "card": null,
              "items": endpoints.cartsUrl + "/" + custId + "/items"
            };
            callback(null, order, addressLink, cardLink);
          });
        },
        function (order, addressLink, cardLink, callback) {
          async.parallel([
              function (callback) {
                console.log("GET Request to: " + addressLink);
                request.get(addressLink, function (error, response, body) {
                  if (error) {
                    callback(error);
                    return;
                  }
                  console.log("Received response: " + JSON.stringify(body));
                  const jsonBody = JSON.parse(body);
                  if (jsonBody.status_code !== 500 && jsonBody._embedded.address[0] != null) {
                    order.address = jsonBody._embedded.address[0]._links.self.href;
                  }
                  callback();
                });
              },
              function (callback) {
                console.log("GET Request to: " + cardLink);
                request.get(cardLink, function (error, response, body) {
                  if (error) {
                    callback(error);
                    return;
                  }
                  console.log("Received response: " + JSON.stringify(body));
                  const jsonBody = JSON.parse(body);
                  if (jsonBody.status_code !== 500 && jsonBody._embedded.card[0] != null) {
                    order.card = jsonBody._embedded.card[0]._links.self.href;
                  }
                  callback();
                });
              }
          ], function (err, result) {
            if (err) {
              callback(err);
              return;
            }
            console.log(result);
            callback(null, order);
          });
        },
        function (order, callback) {
          const options = {
            uri: endpoints.ordersUrl + '/orders',
            method: 'POST',
            json: true,
            body: order
          };
          console.log("Posting Order: " + JSON.stringify(order));
          request(options, function (error, response, body) {
            if (error) {
              return callback(error);
            }
            console.log("Order response: " + JSON.stringify(response));
            console.log("Order response: " + JSON.stringify(body));
            callback(null, response.statusCode, body);
          });
        }
    ],
    function (err, status, result) {
      if (err) {
        return next(err);
      }
      helpers.respondStatusBody(res, status, JSON.stringify(result));
    });
  });

  module.exports = app;
}());
