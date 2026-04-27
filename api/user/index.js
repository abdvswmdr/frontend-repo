'use strict';

const express    = require('express');
const request    = require('request');
const rateLimit  = require('express-rate-limit');

const app      = express();
const AUTH_URL = process.env.AUTH_URL || 'http://auth:8082';

const authLimiter = rateLimit({
    windowMs:       15 * 60 * 1000,
    max:            20,
    message:        { error: 'Too many attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders:  false
});

// GET /login — Basic Auth forwarded to soqoniauth, sets session on success
app.get('/login', authLimiter, function(req, res, next) {
    const options = {
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
    const options = {
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

// PUT /me — update personal details
app.put('/me', function(req, res, next) {
    const userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ error: 'not logged in' });

    request.put({ url: AUTH_URL + '/customers/' + userId, json: true, body: req.body }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

// PUT /me/password — change password
app.put('/me/password', function(req, res, next) {
    const userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ error: 'not logged in' });

    request.put({ url: AUTH_URL + '/customers/' + userId + '/password', json: true, body: req.body }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

// GET /me — check session, fetch user details from soqoniauth
app.get('/me', function(req, res, next) {
    const userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ loggedIn: false });

    request.get({ url: AUTH_URL + '/customers/' + userId, json: true }, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(401).json({ loggedIn: false });
        res.status(200).json({ loggedIn: true, user: body });
    });
});

module.exports = app;
