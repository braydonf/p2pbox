'use strict';

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

function readFile(fileContainer, callback) {
  const fileReader = new FileReader();
  var data = fileContainer.file.data;

  if (data instanceof ArrayBuffer) {
    data = new Blob([data], {type: fileContainer.file.type || 'application/octet-stream'});
  }

  // if (data instanceof Blob) {
  fileReader.onload = function() {
    fileContainer.file.data = fileReader.result;
    callback(fileContainer);
  };
  // }

  fileReader.readAsDataURL(data);
}

function onFileChangeHandler(event) {
  const fileElement = event.target;
  const file = fileElement.files[0];

  broadcast([{
    file: {
      filename: file.name,
      data: file
    },
    type: file.type
  }])
}

function addMessage(options, callback) {
  const messageElement = document.createElement('div');
  const peerIdElement = document.createElement('div');
  console.log(options.peerId);
  peerIdElement.innerText = String(options.peerId);
  messageElement.appendChild(peerIdElement);
  messageElement.classList.add('message');
  callback(messageElement);
  messages.appendChild(messageElement);
}
