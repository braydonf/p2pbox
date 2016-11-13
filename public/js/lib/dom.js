'use strict';

var submitClickHandler;

const TYPES = [
  // text
  {
    mime: /text\/plain/,
    handler: function(options) {
      addMessage(options, function(messageElement) {
        const textElement = document.createElement('span');
        textElement.innerText = options.text;
        messageElement.appendChild(textElement);
      });
    }
  },
  // image
  {
    mime: /image\//,
    handler: function(options) {
      addMessage(options, function(messageElement) {
        const serviceWorkerPath = '/files/' + options.file.filename;

        // Send the image data to the service worker with
        // the filename of and the file data
        const message = {
          filename: options.file.filename,
          file: options.file.data,
          type: options.type
        };
        console.log('about to post message');
        navigator.serviceWorker.controller.postMessage(message);

        // To load or download the data, create an element with a url
        // that points to "files/<filename>"
        setTimeout(function() {
          const img = document.createElement('img');
          img.src = serviceWorkerPath;

          const anchor = document.createElement('a');
          anchor.href = serviceWorkerPath;

          messageElement.classList.add('img');

          anchor.download = options.file.filename;
          anchor.appendChild(img);

          messageElement.appendChild(anchor);
        }, 500);
      });
    }
  },
  // other
  {
    mime: /.*/,
    handler: function(options) {
      addMessage(options, function(messageElement) {
        const anchor = document.createElement('a');

        anchor.href = options.data;
        anchor.download = options.filename;
        anchor.innerHTML = options.filename;
        messageElement.appendChild(anchor);
      });
    }
  }
];

function formSubmitHandler(event) {
  event.preventDefault();
  input.value = '';
}

function addMessage(options, callback) {
  const messageElement = document.createElement('div');
  const peerIdElement = document.createElement('div');
  console.log(options.peerId);
  peerIdElement.innerText = String(options.peerId);
  messageElement.appendChild(peerIdElement);

  messageElement.classList.add('message');
  if (options.peerId === peer.id) {
    messageElement.classList.add('my');
  }

  callback(messageElement);
  messages.insertBefore(messageElement, messages.firstChild);
}
