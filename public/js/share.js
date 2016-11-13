'use strict';

// TODO: on mouse over of a message, highlight all messages from that user
// TODO: multiple data channels for audio "rooms"
// TODO: when connecting, send pubkey and expect peers pubkeys in return
// TODO: when sending data, encrypt data with session key and encrypt session key
//   for all clients

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

        // dont' broadcast an empty message
        if (!input.value) return;

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

/* --- INIT --- */
window.connect();

