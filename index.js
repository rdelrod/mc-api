/**
 * REST API with simple authentication to manage a minecraft server.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 1.0.0
 * @license MIT
 **/

'use strict';

// program specific
const config = require('./config/config.json');

// node.js libs
const express = require('express'),
      mfcd    = require('./lib/mfcd.js');

// middleware
const bodyP   = require('body-parser'),
      morgan  = require('morgan');

let app = express();
let M = new mfcd(config.mcfd.uri, config.mcfd.password);

// express middleware
app.use(bodyP.json());
app.use(morgan('dev'));

// check the authentication
function checkAuth(req, res, next) {
  let apikey = req.get('Authentication').replace('Basic ', '');
  let authparsed = apikey.split(':');
  let accessToken = authparsed[0];
  let accessTokenSecret = authparsed[1];

  let success = false;

  if(config.authentication !== undefined) {
    let isAuthenticated = config.authentication.filter(function(o) {
      if(o.accessToken === accessToken && o.accessTokenSecret === accessTokenSecret) {
        return o;
      }
    })[0];

    if(isAuthenticated !== undefined) {
      success = true;
    }
  }

  if(success) {
    next();
  } else {
    console.log('[mcf-api] authentication failure')
    return res.send({
      success: false,
      reason: 'INVALIDAUTH'
    });
  }
}

/**
 * GET /server/status
 *
 * Get the server status
 **/
app.get('/server/status', function(req, res) {
  let start = Date.now();

  M.getStatus(function(status) {
    let lat = Date.now() - start;
    res.send({
      latency: lat,
      success: true,
      status: status
    });
  });
});

/**
 * GET /server/stop
 *
 * Stop the server.
 **/
app.get('/server/stop', checkAuth, function(req, res) {
  let start = Date.now();

  M.sendCommand('stop', function(resp) {
    let lat = Date.now() - start;
    res.send({
      latency: lat,
      success: resp
    });
  });
});

/**
 * GET /server/start
 *
 * Start the server.
 **/
app.get('/server/start', checkAuth, function(req, res) {
  let start = Date.now();

  M.startServer(function(err) {
    let lat = Date.now() - start;
    res.send({
      latency: lat,
      success: err
    });
  });
})

app.listen(8080);
