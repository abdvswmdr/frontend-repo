(function (){
  'use strict';

  const express   = require("express")
  const helpers   = require("../../helpers")
  const endpoints = require("../endpoints")
  const app       = express()

  app.get("/orders", async function(req, res, next) {
    if (!req.cookies.logged_in) {
      return next(new Error("User not logged in."));
    }
    try {
      const custId = req.session.customerId;
      const { status, body } = await helpers.httpGet(
        endpoints.ordersUrl + "/orders/search/customerId?sort=date&custId=" + custId
      );
      if (status === 404) {
        return helpers.respondStatusBody(res, 201, JSON.stringify([]));
      }
      const result = JSON.parse(body)._embedded.customerOrders;
      helpers.respondStatusBody(res, 201, JSON.stringify(result));
    } catch(err) {
      next(err);
    }
  });

  app.get("/orders/*", async function(req, res, next) {
    try {
      const { status, body } = await helpers.httpGet(endpoints.ordersUrl + req.url.toString());
      helpers.respondStatusBody(res, status, body);
    } catch(err) {
      next(err);
    }
  });

  app.post("/orders", async function(req, res, next) {
    if (!req.cookies.logged_in) {
      return next(new Error("User not logged in."));
    }
    try {
      const custId = req.session.customerId;

      const { body: customerBody } = await helpers.httpGet(endpoints.customersUrl + "/" + custId);
      const customerJson = JSON.parse(customerBody);
      if (customerJson.status_code === 500) {
        return next(new Error("Failed to fetch customer data"));
      }

      const order = {
        customer: customerJson._links.customer.href,
        address:  null,
        card:     null,
        items:    endpoints.cartsUrl + "/" + custId + "/items"
      };

      const [addressResult, cardResult] = await Promise.all([
        helpers.httpGet(customerJson._links.addresses.href),
        helpers.httpGet(customerJson._links.cards.href)
      ]);

      const addressJson = JSON.parse(addressResult.body);
      if (addressJson.status_code !== 500 && addressJson._embedded.address[0] != null) {
        order.address = addressJson._embedded.address[0]._links.self.href;
      }

      const cardJson = JSON.parse(cardResult.body);
      if (cardJson.status_code !== 500 && cardJson._embedded.card[0] != null) {
        order.card = cardJson._embedded.card[0]._links.self.href;
      }

      const { status, body: orderBody } = await helpers.httpRequest({
        uri:    endpoints.ordersUrl + '/orders',
        method: 'POST',
        json:   true,
        body:   order
      });

      helpers.respondStatusBody(res, status, orderBody);
    } catch(err) {
      next(err);
    }
  });

  module.exports = app;
}());
