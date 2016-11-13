'use strict';

var rooms = new Map();
var connections = new Set();

var fs = require('fs');
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var cors = require('cors');

app.set('port', (process.env.PORT || 9000));
var port = app.get('port');

// lets encrypt challenge
app.use('/.well-known', express.static(__dirname + '/.well-known'));

app.use(cors());

console.info('Listening on port ' + port + '...');
var server = app.listen(port);

var options = {
  debug: true
};

var peerServer = ExpressPeerServer(server, options);

app.use('/peerjs', peerServer);

app.get('/connect/:roomId/:peerId', function(req, res, next) {
  /* NB:
   *  Here we would verify a signature to ensure a peer can only
   *  register him/herself
   */

  const roomId = req.params.roomId;
  const peerId = req.params.peerId;
  console.log('roomId: ', roomId);
  console.log('peerId: ', peerId);
  console.dir(rooms);

  // ensure peer is in connection pool
  // if (!connections.has(peerId)) return res.sendStatus(418);
  setTimeout(function() {
    if (!connections.has(peerId)) {
      console.log('removing peer: ', peerId);
      removePeer(peerId, roomId);
    }
  }, 5000);

  var room;

  // check if room exists
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());

  room = rooms.get(roomId);

  // check if peer is registered to room
  if (room.has(peerId)) return res.sendStatus(204);

  // assign peer to room
  room.add(peerId);

  // return room as array
  console.dir(rooms);
  return res.status(201).json(Array.from(room));
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  var body = fs.readFileSync(__dirname + '/index.html');
  res.writeHead(200);
  res.end(body);
});

app.use(function(req, res) {
  var body = fs.readFileSync(__dirname + '/share.html');
  res.writeHead(200);
  res.end(body);
});

peerServer.on('connection', function(id) {
  console.log('connection:', id);
  connections.add(id);
});

peerServer.on('disconnect', function(id) {
  connections.delete(id);
  removePeer(id)
});

function removePeer(id, roomId) {
  if (roomId) {
    return rooms.get(roomId).delete(id);
  }

  rooms.forEach(function(room) {
    if (room.has(id)) {
      room.delete(id);
    }
  })
}
