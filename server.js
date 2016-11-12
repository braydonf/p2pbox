'use strict';

var connections = {};

var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var cors = require('cors');

app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.get('/', function(req, res, next) {
  res.send('Hello world!');
});

var server = app.listen(app.get('port'));

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
  delete connections[id];
});
