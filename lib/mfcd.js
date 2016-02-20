/**
 * Library to interact with mfcd
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 0.0.1
 * @license MIT
 **/

'use strict';

const io = require('socket.io-client');

module.exports = class Mfcd {
  constructor(uri, password) {
    const self = this;

    this.uri = uri;
    this.io = io(uri);

    this.io.on('connect', function() {
      self.io.emit('authenticate', {
        password: password
      });
    });

    this.io.on('disconnect', function(reason) {
      console.log('[lib:mcfd] disconnected reason='+reason);
    })

    this.io.on('reconnecting', function() {
      console.log('[mcfd]: reconnecting to mfcd')
    })
  }

  getStatus(next) {
    const self = this;

    console.log('[lib:mcfd] emit status event');
    this.io.emit('status', {
      type: 'status'
    });

    let callback = (status) => {
      if(status.type !== 'status') {
        console.log('[lib:mfcd] drop, type='+status.type)
        return false;
      }

      // cleanup
      console.log('[lib:mcfd] remove res listener');
      self.io.removeListener('res', callback);

      console.log('[lib:mcfd] execute callback')
      return next(status.data);
    };

    return this.io.on('res', callback);
  }

  sendCommand(command, next) {
    const self = this;

    this.io.emit('sendCommand', {
      type: 'sendCommand',
      command: command
    });

    let callback = (res) => {
      if(res.type !== 'sendCommand') return false;

      // cleanup
      self.io.removeListener('res', callback);

      return next(res.data);
    };

    this.io.on('res', callback);
  }

  startServer(next) {
    const self = this;

    this.io.emit('startServer', {
      type: 'startServer'
    });

    let callback = (res) => {
      if(res.type !== 'startServer') return false;

      // cleanup
      self.io.removeListener('res', callback);

      return next(res.data);
    };

    this.io.on('res', callback);
  }
}
