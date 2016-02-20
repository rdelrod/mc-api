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
let M = new mfcd('http://127.0.0.1:3000', 'fb69b9f1-87bc-47b4-9740-bed3ad5efc35')

// express middleware
app.use(bodyP.json());
app.use(morgan('dev'));

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
app.get('/server/stop', function(req, res) {
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
app.get('/server/start', function(req, res) {
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
