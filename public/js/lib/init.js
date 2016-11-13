'use strict';

// TODO: on mouse over of a message, highlight all messages from that user
// TODO: multiple data channels for audio "rooms"
// TODO: when connecting, send pubkey and expect peers pubkeys in return
// TODO: when sending data, encrypt data with session key and encrypt session key
//   for all clients

const navigator = window.navigator;
const input = document.querySelector('#input');
const messages = document.querySelector('#messages');

navigator.serviceWorker.register('/serviceworker.js', {scope: "/share"}).then(function(registration) {
  console.log('Service Worker registration successful with scope:', registration.scope);
  if (!navigator.serviceWorker.controller || !registration.active) {
    console.log('reloading...');
    return window.location.reload();
  }

  if (!navigator.serviceWorker.controller) {
    console.error('The app is probably broken - try to refresh... thanks! ¯\\_(ツ)_/¯')
  }
}).catch(function(err) {
  console.error('ServiceWorker registration failed::', err);
});

function gotoNewRoom() {
  window.location.pathname = '/share/' + random(8);
}

