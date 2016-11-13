'use strict';

const hostname = window.location.hostname;
const secure = /^https/.test(window.location.protocol);
const port = window.location.port || secure ? 443 : 80;


/* --- INIT --- */
var roomId = window.roomId = null;

if (/^\/share\//.test(window.location.pathname)) {
  roomId = window.location.pathname.replace('/share/', '');
  console.log('In room', roomId);
}

const apiUrlBase = 'http://' + hostname + ':' + port;

var peerIds, peer, pollId;

window.connect = function() {
  peer = new Peer(random(32), {host: hostname, port: port, path: '/peerjs', secure: secure});

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

        // dont' broadcast an empty message
        if (!input.value) return;

        broadcast([{
          text: input.value,
          type: 'text/plain'
        }]);
      };
    });
  });

  peer.on('connection', function(conn) {
    console.log('connection!');
    registerPeerConnHandlers(conn);
  });
};

function broadcast(message) {
  var connections = peer.connections;

  // TODO: set to pending (add progress overlay)
  onDataHandler(peer.id)(message);

  Object.keys(connections).forEach(function(id) {
    // TODO / NOTE: you can have multiple `DataChannels` to a single peer
    var connection = connections[id][0];
    connection.send(message);
  });

  // TODO: set to not pending (remove progress overlay)
}

function onDataHandler(peerId) {
  return function(data) {
    data.forEach(function(datum) {
      datum.peerId = peerId;
      const type = TYPES.filter(function(type) {
        return type.mime.test(datum.type);
      })[0];

      const appendMessage = type.handler;

      Object.keys(datum).forEach(function(key) {
        switch (key) {
          case 'file':
            readFile(datum, appendMessage);
            break;
          case 'text':
            appendMessage(datum);
            break;
        }
      });
    });
  };
}

function registerPeerConnHandlers(conn) {
  var disconnectHandler = function() {
    conn.close();
  };

  conn.on('data', onDataHandler(conn.peer));
  conn.on('error', disconnectHandler);
  conn.on('close', disconnectHandler);
}

function connectPeers(callback) {
  const peersPath = apiUrlBase + '/peers';
  const connectPath = apiUrlBase + '/connect/' + roomId + '/' + peer.id;
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
}

function reconnect() {
  if (peer && peer.disconnected) {
    peer.reconnect();
  }
}

pollId = setInterval(reconnect, 5000);

if (roomId) {
  window.connect();
  document.body.className += 'room';
}
