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
  if(!req.get('Authentication')) {
    return res.send({
      success: false,
      reason: 'NOAUTH'
    });
  }

  let apikey = req.get('Authentication').replace('Basic ', '');
  let authparsed = apikey.split(':');

  // split variables.
  let accessToken = authparsed[0];
  let accessTokenSecret = authparsed[1];

  let success = false;

  // check if the autentication is, well, authenticated.
  if(config.authentication !== undefined) {
    let isAuthenticated = config.authentication.filter(function(o) {
      if(o.accessToken === accessToken && o.accessTokenSecret === accessTokenSecret) {
        return o;
      }
    })[0];

    // if we didn't find the token, it's not authenticated.
    if(isAuthenticated !== undefined) {
      success = true;
    }
  }

  // if not success, fail.
  if(!success) {
    console.log('[mcf-api] authentication failure')
    return res.send({
      success: false,
      reason: 'INVALIDAUTH'
    });
  }

  // continue.
  return next();
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

  M.sendCommand('stop', function(e) {
    let lat = Date.now() - start;

    if(!e) {
      return res.send({
        latency: lat,
        success: false,
        reason: 'NOTRUNNING'
      });
    }

    res.send({
      latency: lat,
      success: e
    });
  });
});

/**
 * GET /server/forceStop
 *
 * Kill the server for sure.
 **/
 app.get('/server/forceStop', checkAuth, function(req, res) {
   let start = Date.now();

   M.forceKill(function() {
     let lat = Date.now() - start;

     res.send({
       latency: lat,
       success: true
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
});

/**
 * GET /server/sendCommand/
 **/
app.get('/server/sendCommand/:command', checkAuth, function(req, res) {
  let command = decodeURIComponent(req.params.command);
  let start = Date.now();

  // send the command.
  M.sendCommand(command, function(e) {
    let lat = Date.now() - start;

    if(!e) {
      return res.send({
        latency: lat,
        success: false,
        reason: 'NOTRUNNING'
      });
    }

    res.send({
      latency: lat,
      success: e,
      command: command
    });
  });
});

app.listen(config.port);
