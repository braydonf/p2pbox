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
      })
    }
  },
  // image
  {
    mime: /image\//,
    handler: function(options) {
      addMessage(options, function(messageElement) {
        const img = document.createElement('img');
        const anchor = document.createElement('a');
        messageElement.classList.add('img');

        anchor.href = options.file.data;
        anchor.download = options.file.filename;
        anchor.appendChild(img);
        img.src = options.file.data;
        messageElement.appendChild(anchor)
      })
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
      })
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
    messageElement.classList.add('my')
  }
  
  callback(messageElement);
  messages.insertBefore(messageElement, messages.firstChild);
}