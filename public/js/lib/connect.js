'use strict';

const hostname = window.location.hostname;
const port = window.location.port || 80;
const roomId = window.location.pathname || random(20);

const apiUrlBase = 'http://' + hostname + ':' + port;

var peerIds, peer, pollId;

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
      })
    });
  }
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
}

function reconnect() {
  if (peer.disconnected) {
    peer.reconnect();
  }
}

pollId = setInterval(reconnect, 5000);
