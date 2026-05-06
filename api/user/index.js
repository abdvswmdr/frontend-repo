'use strict';

const express    = require('express');
const request    = require('request');
const rateLimit  = require('express-rate-limit');

const app      = express();
const AUTH_URL = process.env.AUTH_URL || 'http://auth:8082';

const authLimiter = rateLimit({
    windowMs:        15 * 60 * 1000,
    max:             20,
    message:         { error: 'Too many attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders:   false
});

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.customerId) {
        return res.status(401).json({ error: 'not logged in' });
    }
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'forbidden: admin access required' });
    }
    next();
}

function adminAuthHeader(req) {
    return { 'Authorization': 'Bearer ' + (req.session.token || '') };
}

// GET /login
app.get('/login', authLimiter, function(req, res, next) {
    const options = {
        url:     AUTH_URL + '/login',
        headers: { 'Authorization': req.headers['authorization'] },
        json:    true
    };
    request.get(options, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(authRes.statusCode).json(body);
        req.session.customerId = body.id;
        req.session.token      = body.token;
        req.session.role       = body.role || 'user';
        res.cookie('logged_in', req.session.id, { maxAge: 86400000, httpOnly: false });
        res.status(200).json({ id: body.id, role: body.role });
    });
});

// POST /register
app.post('/register', authLimiter, function(req, res, next) {
    const options = {
        url:  AUTH_URL + '/register',
        json: true,
        body: req.body
    };
    request.post(options, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) return res.status(authRes.statusCode).json(body);
        req.session.customerId = body.id;
        req.session.token      = body.token;
        req.session.role       = body.role || 'user';
        res.cookie('logged_in', req.session.id, { maxAge: 86400000, httpOnly: false });
        res.status(200).json({ id: body.id, role: body.role });
    });
});

// POST /logout
app.post('/logout', function(req, res) {
    req.session.destroy();
    res.clearCookie('logged_in');
    res.status(200).json({ ok: true });
});

// GET /me — profile + role; syncs session role from DB on every call
app.get('/me', function(req, res, next) {
    res.set('Cache-Control', 'no-store');
    const userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ loggedIn: false });

    request.get({ url: AUTH_URL + '/customers/' + userId, json: true }, function(err, authRes, body) {
        if (err) return next(err);
        if (authRes.statusCode !== 200) {
            console.warn('Auth service profile fetch failed for user', userId, 'status:', authRes.statusCode);
            return res.status(401).json({ loggedIn: false });
        }
        console.log('DEBUG: /me profile for user', userId, ':', JSON.stringify(body));
        if (!body || typeof body !== 'object' || !body.id) {
            console.error('Auth service returned invalid profile body:', body);
            return res.status(500).json({ error: 'invalid profile data' });
        }
        req.session.role = body.role || 'user';
        res.status(200).json({ loggedIn: true, user: body });
    });
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

// PUT /me/password
app.put('/me/password', function(req, res, next) {
    const userId = req.session && req.session.customerId;
    if (!userId) return res.status(401).json({ error: 'not logged in' });

    request.put({ url: AUTH_URL + '/customers/' + userId + '/password', json: true, body: req.body }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

// --- Admin routes: session role=admin check + JWT forwarded to soqoniauth ---

app.get('/admin/users', requireAdmin, function(req, res, next) {
    const token = req.session.token || '';
    console.log('DEBUG: /admin/users called, session role:', req.session.role, 'token present:', !!token, 'token length:', token.length);
    const authUrl = AUTH_URL + '/admin/users';
    console.log('DEBUG: calling auth', authUrl);
    request.get({ url: authUrl, json: true, headers: adminAuthHeader(req) }, function(err, authRes, body) {
        console.log('DEBUG: auth /admin/users response:', err ? 'ERR:' + err.message : authRes.statusCode);
        if (err) return next(err);
        if (authRes.statusCode !== 200) {
            return res.status(authRes.statusCode).json({
                error: (body && body.error) || 'Failed to fetch users from auth service'
            });
        }
        res.status(200).json(body);
    });
});

app.put('/admin/users/:id/role', requireAdmin, function(req, res, next) {
    request.put({
        url:     AUTH_URL + '/admin/users/' + req.params.id + '/role',
        json:    true,
        body:    req.body,
        headers: adminAuthHeader(req)
    }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

app.delete('/admin/users/:id', requireAdmin, function(req, res, next) {
    request.delete({
        url:     AUTH_URL + '/admin/users/' + req.params.id,
        json:    true,
        headers: adminAuthHeader(req)
    }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

// POST /admin/promote — bootstrap endpoint, no session required (use via port-forward)
app.post('/admin/promote', function(req, res, next) {
    request.post({ url: AUTH_URL + '/admin/promote', json: true, body: req.body }, function(err, authRes, body) {
        if (err) return next(err);
        res.status(authRes.statusCode).json(body);
    });
});

module.exports = app;
