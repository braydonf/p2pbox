'use strict';

var connections = {};

var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var cors = require('cors');

app.set('port', (process.env.PORT || 9000));
var port = app.get('port');

app.use(cors());
app.get('/', function(req, res, next) {
  res.send('Hello world!');
});

console.info('Listening on port ' + port + '...');
var server = app.listen(port);

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

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/assets'));

peerServer.on('connection', function(id) {
  console.log('connection:', id);
  connections[id] = id;
});

peerServer.on('disconnect', function(id) {
  delete connections[id];
});
