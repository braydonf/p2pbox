'use strict';

// TODO: on mouse over of a message, highlight all messages from that user
// TODO: multiple data channels for audio "rooms"
// TODO: when connecting, send pubkey and expect peers pubkeys in return
// TODO: when sending data, encrypt data with session key and encrypt session key
//   for all clients

const input = document.querySelector('#input');
const messages = document.querySelector('#messages');

/* --- INIT --- */
window.connect();

// Register the service worker
navigator.serviceWorker.register('/serviceworker.js', { scope: "/" }).then(
    function(registration) {
      if (registration.installing) {
        registration.installing.postMessage('Howdy from your installing page.');
      }
    },
    function(why) {
      console.error('Installing the worker failed!:', why);
    }
);
