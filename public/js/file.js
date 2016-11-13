'use strict';

const TYPES = [
  // text
  {
    mime: /text\/plain/,
    handler: function(options) {
      addMessage(function(messageElement) {
        messageElement.classList.add('message');
        messageElement.innerText = options.text;
      })
    }
  },
  // image
  {
    mime: /image\//,
    handler: function(options) {
      addMessage(function(messageElement) {
        const img = document.createElement('img');
        const anchor = document.createElement('a');

        anchor.href = options.data;
        anchor.download = options.filename;
        anchor.appendChild(img);
        img.src = options.data;
        messageElement.appendChild(anchor)
      })
    }
  },
  // other
  {
    mime: /.*/,
    handler: function(options) {
      addMessage(function(messageElement) {
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
  var data = fileContainer.data;

  if (data instanceof ArrayBuffer) {
    data = new Blob([data], {type: fileContainer.type || 'application/octet-stream'});
  }

  // if (data instanceof Blob) {
  fileReader.onload = function() {
    fileContainer.data = fileReader.result;
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

function addMessage(callback) {
  const messageElement = document.createElement('div');
  callback(messageElement);
  messages.appendChild(messageElement);
}
