'use strict';

// TODO: on mouse over of a message, highlight all messages from that user
// TODO: multiple data channels for audio "rooms"
// TODO: when connecting, send pubkey and expect peers pubkeys in return
// TODO: when sending data, encrypt data with session key and encrypt session key
//   for all clients

const input = document.querySelector('#input');
const messages = document.querySelector('#messages');

navigator.serviceWorker.register('/serviceworker.js', { scope: "/" }).then(function(registration) {
  console.log('Service Worker registration successful with scope:', registration.scope);
}).catch(function(err) {
  console.error('ServiceWorker registration failed::', err);
});

function gotoNewRoom() {
  window.location.pathname = '/share/' + random(8);
}

