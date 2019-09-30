'use strict';
const net = require('net');
const {EventEmitter} = require('events');

class AsteriskManager extends EventEmitter {
  constructor(host, port) {
    super();
    this.host = host;
    this.port = port;
    this.actions = {};
    this.buf = "";
    this.actionCount = 0;
  }

  connect() {
    this.conn = net.createConnection(this.port, this.host);
    this.conn.setKeepAlive(true);
    this.conn.setNoDelay(true);

    this.conn.on('data', this.handleData.bind(this));
  }

  handleData(data) {
    const chunk = data.toString();
    let i = 0;
    let piece = "";

    this.buf += chunk;
    while((i = this.buf.indexOf('\r\n\r\n')) > -1) {
      piece = this.buf.substr(0, i);
      this.buf = this.buf.substr(i+4);

      const lines = piece.toString().split('\r\n');
      const msg = lines.filter(line => line.indexOf(': ') > -1).reduce((acc, line) => {
        const [k,v] = line.split(': ');
        acc[k] = v;
        return acc;
      }, {})

      if (msg.hasOwnProperty('Response')) {
        this.handleCallback(msg.ActionID, msg);
      } else if (msg.hasOwnProperty('Event')) {
        this.emit(msg.Event, msg);
      }
    }
  }

  handleCallback(actionid, data) {
    const cb = this.actions[actionid];
    if (typeof cb === 'function') {
      cb(data);
    }
    delete this.actions[actionid];
  }

  send(data, cb) {
    const actionid = Date.now() + this.actionCount++
    this.actions[actionid] = cb;

    const msg = Object.entries(data).reduce((msg, entry) => `${msg}${entry.join(":")}\r\n`, "") + `actionid: ${actionid}\r\n\r\n`;
    this.conn.write(msg);
  }

  action(action, args, cb) {
    this.send({action, ...args}, cb)
  }

  login(user, pass) {
    this.action('login', {
      username: user,
      secret: pass,
      event: 'on'
    });
  }
}

module.exports = AsteriskManager
