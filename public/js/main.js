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
const roomId = window.location.pathname || random(20);

const apiUrlBase = 'http://' + hostname + ':' + port;

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


  peer.on('open', function(id) {
    console.log('listening:', id);
    
    // bug or something in firefox - this happens too soon
    connectPeers(function() {
      submitClickHandler = function(event) {
        console.log('broadcasting:', input.value);
        broadcast([{
          text: input.value,
          type: 'text/plain'
        }]);
      }
    });
  });

  peer.on('connection', function(conn) {
    console.log('connection!');
    registerPeerConnHandlers(conn);
  });
};

function onDataHandler(data) {
  data.forEach(function(datum) {
    const type = TYPES.filter(function(type) {
      return type.mime.test(datum.type);
    })[0];

    const appendMessage = type.handler;

    Object.keys(datum).forEach(function(key) {
      switch (key) {
        case 'file':
          readFile(datum.file, appendMessage);
          break;
        case 'text':
          appendMessage(datum);
          break;
      }
    })
  });
}

function registerPeerConnHandlers(conn) {
  var disconnectHandler = function() {
    conn.close();
  };

  conn.on('data', onDataHandler);
  conn.on('error', disconnectHandler);
  conn.on('close', disconnectHandler);
}

function connectPeers(callback) {
  const peersPath = apiUrlBase + '/peers';
  const connectPath = apiUrlBase + '/connect' + roomId + '/' + peer.id;
  var peersRequest = new XMLHttpRequest();
  var connectionRequest = new XMLHttpRequest();
  var peerIds = [];

  connectionRequest.open('get', connectPath);
  connectionRequest.onload = function() {
    try {
      switch (connectionRequest.status) {
        case 201:
          peerIds = JSON.parse(connectionRequest.response);
          peerIds.forEach(function(id) {
            if (id === peer.id) return;

            console.log('connecting to:', id);
            var conn = peer.connect(id);
            registerPeerConnHandlers(conn);
          });
          break;
        case 204:
          break;
        default:
          console.error('Unexpected status code from `/connect...`: ' + connectionRequest.status);
      }

    } catch (err) {
      console.error(err);
    }

    callback();
  };

  connectionRequest.send();

//   peersRequest.open('get', peersPath);
//   peersRequest.onload = function() {
//     try {
//       peerIds = JSON.parse(peersRequest.response);
//       peerIds.forEach(function(id) {
//         if (id === peer.id) return;
//
//         console.log('connecting to:', id);
//         var conn = peer.connect(id);
//         registerPeerConnHandlers(conn);
//       });
//     } catch (err) {
//       console.error(err);
//     }
//
//     callback();
//   };
//
//   peersRequest.send();
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
