'use strict';

// const input = document.querySelector('#input');
// const button = document.querySelector('#button');
// const messages = document.querySelector('#messages');

var peerIds;

window.connect = function() {
  // No API key required when not using cloud server
  var peer = new Peer(random(10), {host: 'localhost', port: 9000, path: '/peerjs'});
  console.log('I am ', peer.id);
  window.peer = peer;

  console.log(peer);
  peer.on('error', function(err) {
    console.log('error:', err);
  });

  connectPeers(peer);

  peer.on('open', function(id) {
    console.log('listenint:', id);
  });

  peer.on('connection', function(conn) {
    connectPeers(peer);
    console.log('connection!');
    conn.send('hi there!');
    conn.on('data', function(data) {
      console.log('data:', data)
    })
  });
};

function connectPeers(me) {
  var xhr = new XMLHttpRequest();
  var peerIds = [];

  xhr.open('get', 'http://localhost:9000/peers');
  xhr.onload = function() {
    try {
      console.log('xhr response:', xhr.response);
      peerIds = JSON.parse(xhr.response);
      peerIds.forEach(function(id) {
        console.log('id:', id);
        console.log('me.id:', me.id);
        if (id === me.id) return;

        console.log('peer:', id);
        peer.connect(id);
      });
    } catch (err) {
      return console.error(err);
    }
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

  return buf.map(function(int) {
    return int.toString(16)
  }).join('');
};
