/**
 * REST API with simple authentication to manage a minecraft server.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 1.1.0
 * @license MIT
 **/

'use strict';

// program specific
const config  = require('./config/config.json');
let   pmx     = require('pmx');
pmx.init({
  http: true,
  network: true
});

const express = require('express'),
      mfcd    = require('./lib/mfcd.js');

const bodyP   = require('body-parser'),
      cors    = require('cors'),
      morgan  = require('morgan');

// instance express & mcfd
let app = express();
let M = new mfcd(config.mcfd.uri, config.mcfd.password);

// express middleware
app.use(bodyP.json());
app.use(cors());
app.use(morgan('dev'));
app.use(pmx.expressErrorHandler()); // pmx express error reporting!

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
    });

    // We only care about result 0.
    isAuthenticated = isAuthenticated[0];

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
 * Start a Two Factor Auth request.
 **/
app.get('/auth/tfa/:user', function(req, res) {
  let start = Date.now();

  res.send({
    latency: 0,
    success: false
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

// listen on the port specified by config
app.listen(config.port);
