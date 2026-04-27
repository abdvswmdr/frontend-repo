(function (){
  'use strict';

  const express   = require("express")
  const helpers   = require("../../helpers")
  const endpoints = require("../endpoints")
  const app       = express()

  app.get("/cart", async function(req, res, next) {
    try {
      const custId = helpers.getCustomerId(req, app.get("env"));
      console.log("Request received: " + req.url + ", " + req.query.custId);
      console.log("Customer ID: " + custId);
      const { status, body } = await helpers.httpGet(endpoints.cartsUrl + "/" + custId + "/items");
      helpers.respondStatusBody(res, status, body);
    } catch(err) {
      next(err);
    }
  });

  app.delete("/cart", async function(req, res, next) {
    try {
      const custId = helpers.getCustomerId(req, app.get("env"));
      console.log('Attempting to delete cart for user: ' + custId);
      const { status } = await helpers.httpRequest({ uri: endpoints.cartsUrl + "/" + custId, method: 'DELETE' });
      console.log('User cart deleted with status: ' + status);
      helpers.respondStatus(res, status);
    } catch(err) {
      next(err);
    }
  });

  app.delete("/cart/:id", async function(req, res, next) {
    if (req.params.id == null) {
      return next(new Error("Must pass id of item to delete"));
    }
    try {
      console.log("Delete item from cart: " + req.url);
      const custId = helpers.getCustomerId(req, app.get("env"));
      const { status } = await helpers.httpRequest({
        uri: endpoints.cartsUrl + "/" + custId + "/items/" + req.params.id.toString(),
        method: 'DELETE'
      });
      console.log('Item deleted with status: ' + status);
      helpers.respondStatus(res, status);
    } catch(err) {
      next(err);
    }
  });

  app.post("/cart", async function(req, res, next) {
    if (req.body.id == null) {
      return next(new Error("Must pass id of item to add"));
    }
    try {
      const custId = helpers.getCustomerId(req, app.get("env"));
      console.log("Attempting to add to cart: " + JSON.stringify(req.body));

      const { body: catalogueBody } = await helpers.httpGet(endpoints.catalogueUrl + "/catalogue/" + req.body.id.toString());
      const item = JSON.parse(catalogueBody);

      if (item.count !== undefined && item.count === 0) {
        return res.status(409).json({ error: "This item is out of stock." });
      }

      const { status: cartStatus } = await helpers.httpRequest({
        uri: endpoints.cartsUrl + "/" + custId + "/items",
        method: 'POST',
        json: true,
        body: { itemId: item.id, unitPrice: item.price }
      });

      if (cartStatus !== 201) {
        return next(new Error("Unable to add to cart. Status code: " + cartStatus));
      }

      helpers.httpRequest({ uri: endpoints.catalogueUrl + "/catalogue/" + item.id + "/stock", method: 'PUT' })
        .catch(err => console.warn("stock decrement failed:", err.message));

      helpers.respondStatus(res, cartStatus);
    } catch(err) {
      next(err);
    }
  });

  app.post("/cart/update", async function(req, res, next) {
    if (req.body.id == null) {
      return next(new Error("Must pass id of item to update"));
    }
    if (req.body.quantity == null) {
      return next(new Error("Must pass quantity to update"));
    }
    try {
      const custId = helpers.getCustomerId(req, app.get("env"));
      console.log("Attempting to update cart item: " + JSON.stringify(req.body));

      const { body: catalogueBody } = await helpers.httpGet(endpoints.catalogueUrl + "/catalogue/" + req.body.id.toString());
      const item = JSON.parse(catalogueBody);

      const { status } = await helpers.httpRequest({
        uri: endpoints.cartsUrl + "/" + custId + "/items",
        method: 'PATCH',
        json: true,
        body: { itemId: item.id, quantity: parseInt(req.body.quantity), unitPrice: item.price }
      });

      if (status !== 202) {
        return next(new Error("Unable to update cart. Status code: " + status));
      }
      helpers.respondStatus(res, status);
    } catch(err) {
      next(err);
    }
  });

  module.exports = app;
}());
