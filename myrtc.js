'use strict';

const input = document.querySelector('#input');
const button = document.querySelector('#button');
const messages = document.querySelector('#messages');

var peerIds;
var peer;

var hostname = (window.location.hostname);

window.connect = function() {
  // No API key required when not using cloud server
  peer = new Peer(random(10), {host: hostname, port: 9000, path: '/peerjs'});

  console.log('I am ', peer.id);
  window.peer = peer;

  console.log(peer);
  peer.on('error', function(err) {
    console.log('error:', err);
  });

  connectPeers(function() {
    button.onclick = function(event) {
      console.log('broadcasting:', input.value);
      broadcast(input.value);
    }
  });

  peer.on('open', function(id) {
    console.log('listening:', id);
  });

  peer.on('connection', function(conn) {
    console.log('connection!');
    registerDataHandler(conn);
  });
};

function registerDataHandler(conn) {
  conn.send('hi there!');
  conn.on('data', function(data) {
    console.log('data:', data)
  })
}

function connectPeers(callback) {
  var xhr = new XMLHttpRequest();
  var peerIds = [];

  xhr.open('get', 'http://' + hostname + ':9000/peers');
  xhr.onload = function() {
    try {
      peerIds = JSON.parse(xhr.response);
      peerIds.forEach(function(id) {
        if (id === peer.id) return;

        console.log('connecting to:', id);
        var conn = peer.connect(id);
        var disconnectHandler = function() {
          conn.close();
        };

        conn.on('error', disconnectHandler);
        conn.on('close', disconnectHandler);

        conn.send('hi there!');
        conn.on('data', function(data) {
          console.log('data:', data)
        })
      });
    } catch (err) {
      console.error(err);
    }

    callback();
  };

  xhr.send();
}

function random(size) {
  if (!window.crypto && !window.msCrypto)
    throw new Error('window.crypto not available');

  if (window.crypto && window.crypto.getRandomValues)
    var crypto = window.crypto;
  else if (window.msCrypto && window.msCrypto.getRandomValues) //internet explorer
    var crypto = window.msCrypto;
  else
    throw new Error('window.crypto.getRandomValues not available');

  var buf = new Uint8Array(size);
  crypto.getRandomValues(buf);

  return String(buf.map(function(int) {
    return int.toString(16)
  }).join(''));
}

function broadcast(message) {
  var connections = peer.connections;

  Object.keys(connections).forEach(function(id) {
    // TODO / NOTE: you can have multiple `DataChannels` to a single peer
    var connection = connections[id][0];
    connection.send(message);
  })
}


/* ------- INIT -------- */
window.connect();
