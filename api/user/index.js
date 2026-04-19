'use strict';

var express = require('express');
var request = require('request');

var app = express();
var AUTH_URL = process.env.AUTH_URL || 'http://auth:8082';

// GET /login — Basic Auth forwarded to soqoniauth, sets session on success
app.get('/login', function(req, res, next) {
    var options = {
        url: AUTH_URL + '/login',
        headers: { 'Authorization': req.headers['authorization'] },
        json: true
    };
    request.get(options, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(authRes.statusCode).json(body);
        req.session.customerId = body.id;
        res.cookie('logged_in', req.session.id, { maxAge: 86400000, httpOnly: false });
        res.status(200).json({ id: body.id });
    });
});

// POST /register — forwarded to soqoniauth
app.post('/register', function(req, res, next) {
    var options = {
        url: AUTH_URL + '/register',
        json: true,
        body: req.body
    };
    request.post(options, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(authRes.statusCode).json(body);
        req.session.customerId = body.id;
        res.cookie('logged_in', req.session.id, { maxAge: 86400000, httpOnly: false });
        res.status(200).json({ id: body.id });
    });
});

// POST /logout
app.post('/logout', function(req, res) {
    req.session.destroy();
    res.clearCookie('logged_in');
    res.status(200).json({ ok: true });
});

// GET /me — check session, fetch user details from soqoniauth
app.get('/me', function(req, res, next) {
    var userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ loggedIn: false });

    request.get({ url: AUTH_URL + '/customers/' + userId, json: true }, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(401).json({ loggedIn: false });
        res.status(200).json({ loggedIn: true, user: body });
    });
});

module.exports = app;
