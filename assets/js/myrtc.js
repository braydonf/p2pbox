'use strict';

// TODO: on mouse over of a message, highlight all messages from that user
// TODO: multiple data channels for audio "rooms"
// TODO: when connecting, send pubkey and expect peers pubkeys in return
// TODO: when sending data, encrypt data with session key and encrypt session key
//   for all clients

const input = document.querySelector('#input');
const messages = document.querySelector('#messages');

const hostname = window.location.hostname;
const port = window.location.port || 80;

var peerIds, peer, submitClickHandler, pollId;

window.connect = function() {
  peer = new Peer(random(10), {host: hostname, port: port, path: '/peerjs'});

  console.log('I am ', peer.id);
  window.peer = peer;

  console.log(peer);
  peer.on('error', function(err) {
    console.log('error:', err);
  });

  peer.on('disconnect', reconnect);

  connectPeers(function() {
    submitClickHandler = function(event) {
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

function onDataHandler(data) {
  console.log(data);
  var message = document.createElement('div');
  message.innerText = data;
  messages.appendChild(message);
}

function registerDataHandler(conn) {
  conn.on('data', onDataHandler)
}

function connectPeers(callback) {
  var xhr = new XMLHttpRequest();
  var peerIds = [];

  xhr.open('get', 'http://' + hostname + ':' + port + '/peers');
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
        conn.on('data', onDataHandler)
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

  // TODO: set to pending (add progress overlay)
  onDataHandler(message);

  Object.keys(connections).forEach(function(id) {
    // TODO / NOTE: you can have multiple `DataChannels` to a single peer
    var connection = connections[id][0];
    connection.send(message);
  });

  // TODO: set to not pending (remove progress overlay)
}

function reconnect() {
  if (peer.disconnected) {
    peer.reconnect();
  }
}

function formSubmitHandler(event) {
  event.preventDefault();
  input.value = '';
}


/* --- INIT --- */
window.connect();

pollId = setInterval(reconnect, 5000);
