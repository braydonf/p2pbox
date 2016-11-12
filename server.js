//var PeerServer = require('peer').PeerServer;
//var server = PeerServer({port: 9000, path: '/myapp'});

var connections = {};

var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var cors = require('cors');

app.use(cors());
app.get('/', function(req, res, next) {
  res.send('Hello world!');
});

var server = app.listen(9000);

var options = {
  debug: true
};

var peerServer = ExpressPeerServer(server, options);

app.use('/peerjs', peerServer);

app.get('/peers', function(req, res, next) {
  var connectionArray = Object.keys(connections);
  console.log(connectionArray);
  res.json(connectionArray);
  res.end();
});

peerServer.on('connection', function(id) {
  console.log('connection:', id);
  connections[id] = id;
});

peerServer.on('disconnect', function(id) {
  delete connections[id]
});
